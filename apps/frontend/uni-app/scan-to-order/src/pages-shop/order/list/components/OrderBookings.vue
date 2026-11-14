<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import ListEnd from '@/components/list-end/index.vue'
import PageLoading from '@/components/page-loading/index.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { merchantClock, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { confirm, showError } from '@/utils/project/interaction'
import { fetchShopBookings, updateShopBooking } from '../api/bookings'
import { bookingActions, bookingLabels, canUpdateBooking } from '../models/booking'
import type { BookingAction, ShopBooking } from '../models/booking'
import { formatOrderTime } from '../models/presentation'

const props = defineProps<{ active: boolean, pending?: boolean }>()
const context = useMerchantShopStore()
const records = ref<ShopBooking[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const tab = ref(props.pending ? 'pending' : 'all')
const filters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'active', label: '预约中' },
  { key: 'cancelled', label: '已取消' },
  { key: 'completed', label: '已完成' },
]
const list = computed(() => records.value
  .filter((item) => {
    if (tab.value === 'pending')
      return canUpdateBooking(item.status, 'confirm')
    return tab.value === 'all' || (tab.value === 'active' ? ['pending', 'confirmed'].includes(item.status) : item.status === tab.value)
  })
  .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt)))
const paging = ref<{ reload: () => void, complete: (data: false) => void, completeByTotal: (data: ShopBooking[], total: number) => void }>()
const visibleBookings = ref<ShopBooking[]>([])
let pulling = false

async function queryBookings(page: number, size: number, source: string) {
  const current = paging.value
  if (source === 'user-pull-down') {
    pulling = true
    try {
      await refresh()
      await nextTick()
    }
    finally {
      pulling = false
    }
  }
  if (!current || current !== paging.value)
    return
  if (error.value) {
    current.complete(false)
    return
  }
  const start = (page - 1) * size
  current.completeByTotal(list.value.slice(start, start + size), list.value.length)
}

watch(list, () => {
  if (!pulling)
    paging.value?.reload()
})
const actions: BookingAction[] = ['confirm', 'cancel', 'complete']
let request = 0

function bookingTime(item: ShopBooking) {
  return formatOrderTime(item.scheduledAt, merchantClock(context.current)(new Date(item.scheduledAt)))
}

async function refresh() {
  if (!props.active || !context.can('booking.read'))
    return
  const started = ++request
  loading.value = true
  error.value = ''
  try {
    const snapshot = context.capture('booking.read')
    const result = await fetchShopBookings(snapshot)
    if (request === started && context.matches(snapshot))
      records.value = result
  }
  catch (reason) {
    if (request === started)
      error.value = reason instanceof Error ? reason.message : st('预约读取失败')
  }
  finally {
    if (request === started)
      loading.value = false
  }
}

watch([() => props.active, () => context.revision], () => {
  request++
  records.value = []
  visibleBookings.value = []
  error.value = ''
  loading.value = false
  void refresh()
}, { immediate: true, flush: 'sync' })

async function apply(item: ShopBooking, action: BookingAction) {
  if (submitting.value)
    return
  const revision = context.revision
  submitting.value = true
  try {
    if (!await confirm({ title: bookingActions[action].label, content: item.id }) || revision !== context.revision || !props.active)
      return
    const snapshot = context.capture('booking.manage')
    if (snapshot.shopId !== item.shopId)
      return
    await updateShopBooking(snapshot, item, action)
    if (context.matches(snapshot))
      await refresh()
  }
  catch (reason) {
    if (revision === context.revision && props.active) {
      showError(reason)
      await refresh()
    }
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <z-paging :key="context.revision" ref="paging" v-model="visibleBookings" :default-page-size="10" hide-empty-view safe-area-inset-bottom @query="queryBookings">
    <template #refresher="{ refresherStatus }">
      <PageLoading inline :refresh-status="refresherStatus" class="h-80rpx w-full" />
    </template>
    <template #loadingMoreLoading>
      <PageLoading inline class="w-full py-24rpx" />
    </template>
    <template #loadingMoreNoMore>
      <ListEnd />
    </template>
    <template #top>
      <wd-tabs v-model="tab" color="#6b503c" line-width="40">
        <wd-tab v-for="filter in filters" :key="filter.key" :name="filter.key" :title="filter.key === 'pending' ? t('shop.orderCenter.pendingStatus.awaitingConfirmation') : st(filter.label)" />
      </wd-tabs>
    </template>
    <view v-if="error" class="flex items-center justify-between gap-12rpx p-24rpx">
      <text>{{ st(error) }}</text>
      <wd-button size="small" plain @click="refresh">
        {{ st('重试') }}
      </wd-button>
    </view>
    <PageLoading v-if="loading && !visibleBookings.length" />
    <fg-empty v-else-if="!error && !visibleBookings.length" icon="i-carbon-calendar" :text="st('暂无预约')" />
    <view v-if="visibleBookings.length" class="p-24rpx space-y-16rpx">
      <view v-for="item in visibleBookings" :key="item.id" class="rounded-24rpx bg-white p-24rpx">
        <view class="flex flex-wrap items-center justify-between gap-12rpx">
          <text class="font-semibold">{{ bookingTime(item) }} · {{ item.people }} {{ st('人') }}</text>
          <text>{{ st(bookingLabels[item.status]) }}</text>
        </view>
        <view class="mt-8rpx text-24rpx text-gray-500">
          {{ item.customer }} · {{ item.id }}
        </view>
        <view v-if="context.can('booking.manage')" class="mt-16rpx flex flex-wrap gap-12rpx">
          <template v-for="action in actions" :key="action">
            <wd-button v-if="canUpdateBooking(item.status, action)" size="small" plain :disabled="submitting" @click="apply(item, action)">
              {{ st(bookingActions[action].label) }}
            </wd-button>
          </template>
        </view>
      </view>
    </view>
  </z-paging>
</template>
