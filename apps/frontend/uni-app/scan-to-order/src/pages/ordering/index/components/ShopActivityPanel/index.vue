<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
/**
 * ============================================================================
 * 【文件概述】门店活动底部详情；打开及可见期间刷新服务端快照，关闭后忽略旧响应。
 * 【方法与导出清单】默认组件：modelValue、shopId、shopName、showEnter；enter 回传新快照。
 * 【综合使用示例】import ShopActivityPanel from '../ShopActivityPanel/index.vue'; // 绑定门店及开关
 * ============================================================================
 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import type { Shop } from '../../models/types'
import { shopApi } from '../../api/shop.api'
import { toShopDetail } from '../../models/mappers'
import { promotionDateRange, visiblePromotions } from '../../domain/promotion.rules'
import { shopBusinessState } from '../../domain/shop.rules'

const props = defineProps<{ modelValue: boolean, shopId: number, shopName: string, activityId?: string, showEnter?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean], 'enter': [shop: Shop] }>()
const shop = ref<Shop | null>(null)
const loading = ref(false)
const error = ref('')
const now = ref(Date.now())
const activities = computed(() => visiblePromotions(shop.value ?? {}, now.value).filter(activity => !props.activityId || activity.id === props.activityId).slice(0, 1))
const canEnter = computed(() => props.showEnter && !loading.value && !error.value && !!shop.value && activities.value.length > 0)
let version = 0
let lastRefresh = 0
let timer: ReturnType<typeof setInterval> | undefined

/** 刷新当前门店。无参数。@returns Promise<void>，关闭、换店及卸载后不回写，失败可重试。@example await refresh() // => 更新详情 */
async function refresh() {
  const ticket = ++version
  lastRefresh = Date.now()
  loading.value = true
  error.value = ''
  try {
    const next = toShopDetail(await shopApi.detail(props.shopId)).info
    if (ticket === version && props.modelValue) {
      if (next.id !== props.shopId)
        throw new Error('门店数据不一致')
      shop.value = next
      now.value = Date.now()
    }
  }
  catch {
    if (ticket === version && props.modelValue)
      error.value = '活动加载失败，请重试'
  }
  finally {
    if (ticket === version)
      loading.value = false
  }
}

/** 进入前再次确认服务端数据。无参数。@returns Promise<void>，过期、下架和未开业不进入。@example await enter() // => 合法时发出 enter */
async function enter() {
  if (loading.value)
    return
  await refresh()
  if (props.modelValue && canEnter.value && shop.value) {
    emit('enter', shop.value)
    emit('update:modelValue', false)
  }
}
watch(() => [props.modelValue, props.shopId], () => {
  version++
  clearInterval(timer)
  shop.value = null
  error.value = ''
  loading.value = false
  if (props.modelValue) {
    void refresh()
    timer = setInterval(() => {
      now.value = Date.now()
      if (!loading.value && now.value - lastRefresh >= 30000)
        void refresh()
    }, 1000)
  }
}, { immediate: true })
onScopeDispose(() => {
  version++
  clearInterval(timer)
})
</script>

<template>
  <wd-popup :model-value="modelValue" position="bottom" root-portal round safe-area-inset-bottom :z-index="1400" custom-style="background: #fff9f0;" @update:model-value="emit('update:modelValue', $event)">
    <view class="flex items-start justify-between gap-24rpx p-32rpx">
      <view class="min-w-0 flex-1">
        <text class="block text-32rpx text-[#2c1810] font-600">门店优惠活动</text>
        <text class="mt-8rpx block text-26rpx text-[#777]">{{ shop?.name || shopName }}</text>
      </view>
      <button class="m-0 bg-transparent px-12rpx text-26rpx text-[#8b4513]" aria-label="关闭活动详情" @tap="emit('update:modelValue', false)">
        关闭
      </button>
    </view>
    <scroll-view scroll-y class="activity-scroll">
      <view class="px-32rpx pb-24rpx">
        <view v-if="error" class="py-48rpx text-center">
          <text class="block text-26rpx text-[#777]">{{ error }}</text>
          <button class="mt-24rpx text-26rpx text-[#8b4513]" @tap="refresh">
            重新加载
          </button>
        </view>
        <view v-else-if="loading && !shop" class="py-48rpx text-center text-26rpx text-[#777]">
          <PageLoading title="正在加载活动…" />
        </view>
        <view v-else-if="!activities.length" class="py-48rpx text-center text-26rpx text-[#777]">
          活动已结束或已下架，暂无可查看的优惠活动
        </view>
        <template v-else>
          <view v-if="shop && shopBusinessState(shop) === 'upcoming'" class="mb-24rpx text-26rpx text-[#777]">
            {{ shop.openingDate ? `预计 ${shop.openingDate} 开业` : '开业时间待公布' }} · 开业后可点餐
          </view>
          <view v-for="activity in activities" :key="activity.id" class="mb-24rpx rounded-20rpx bg-white p-28rpx">
            <view class="flex items-start justify-between gap-16rpx">
              <text class="min-w-0 flex-1 text-30rpx text-[#8b4513] font-600">{{ activity.title }}</text>
            </view>
            <text class="mt-20rpx block text-24rpx text-[#777]">活动时间：{{ promotionDateRange(activity) }}</text>
            <text class="mt-24rpx block text-26rpx text-[#2c1810] font-600">活动说明</text>
            <text class="mt-12rpx block whitespace-pre-wrap text-26rpx text-[#5a4a42] leading-42rpx">{{ activity.rules }}</text>
          </view>
        </template>
      </view>
    </scroll-view>
    <view v-if="showEnter && activities.length && !error" class="px-32rpx pb-24rpx">
      <button v-if="showEnter" class="rounded-full bg-[#8b4513] text-28rpx text-white" :disabled="!canEnter" @tap="enter">
        <PageLoading v-if="loading" inline size="28rpx" title="正在确认门店…" color="currentColor" />
        <text v-else>进入门店</text>
      </button>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.activity-scroll {
  height: 58vh;
}
button::after {
  border: none;
}
</style>
