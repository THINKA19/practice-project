<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import PageLoading from '@/components/page-loading/index.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { useMerchantPage, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { ShopRoutes } from '@/pages-shop/routes'
import { useMerchantNoticeLifecycle, useMerchantNoticeStore } from '@/pages-shop/shop/index'
import { toast } from '@/utils/project/interaction'
import { navigate } from '@/utils/project/navigation'
import { orderCategories, parseOrderListQuery } from '../list/models/filters'
import type { OrderCategory } from '../list/models/filters'
import { useOrderCenterStore } from './store'

definePage({
  style: { navigationBarTitleText: '订单中心' },
})

const categoryIcons = {
  'dine-in': 'i-carbon-restaurant',
  'delivery': 'i-carbon-delivery',
  'pickup': 'i-carbon-shopping-bag',
  'booking': 'i-carbon-calendar',
  'cashier': 'i-carbon-purchase',
} satisfies Record<OrderCategory, string>

const access = useMerchantPage()
useMerchantNoticeLifecycle(access)
const context = useMerchantShopStore()
const summary = useOrderCenterStore()
const notices = useMerchantNoticeStore()
const granted = computed(() => access.granted.value)
const legacySuffix = ref('')
const replacing = ref(false)
const title = computed(() => st('订单中心'))
const categories = computed(() => orderCategories.filter((item) => {
  if (item.key === 'booking')
    return context.can('booking.read')
  if (item.key === 'cashier')
    return context.current?.roleTemplate === 'owner' && context.can('order.amount.read')
  return true
}))
const rows = computed(() => categories.value.map(category => ({
  ...category,
  summary: summary.items.find(item => item.category === category.key),
})))

async function openCategory(category: OrderCategory) {
  if (!granted.value)
    return
  const result = await navigate(ShopRoutes.Operations.orderList, { category, pending: summary.items.find(item => item.category === category)?.status })
  if (!result.ok)
    toast(st('无法打开详情，请重试'))
}

onLoad((query) => {
  const target = parseOrderListQuery(query)
  const suffix = target.category ? `category=${target.category}` : target.metric ? `filter=${target.metric}` : ''
  legacySuffix.value = suffix
})
watch(granted, (allowed) => {
  if (!allowed || !legacySuffix.value || replacing.value)
    return
  const suffix = legacySuffix.value
  legacySuffix.value = ''
  replacing.value = true
  uni.redirectTo({
    url: `${ShopRoutes.Operations.orderList}?${suffix}`,
    fail: () => {
      replacing.value = false
      toast(st('无法打开详情，请重试'))
    },
  })
})

watch([granted, replacing, () => context.revision, () => notices.orderChangeVersion], ([allowed, redirecting]) => {
  if (allowed && !redirecting)
    void summary.refresh()
})
onShow(() => uni.setNavigationBarTitle({ title: title.value }))
watch(title, value => uni.setNavigationBarTitle({ title: value }))
</script>

<template>
  <view class="box-border min-h-100vh bg-white">
    <PageLoading v-if="!granted || replacing" />
    <view v-else class="order-categories grid mx-auto box-border max-w-960px gap-x-6 px-4">
      <button
        v-for="item in rows"
        :key="item.key"
        class="order-category m-0 min-w-0 flex items-center gap-3 rounded-none bg-white px-0 py-4 text-left text-[#222] leading-normal"
        hover-class="order-category-pressed"
        @click="openCategory(item.key)"
      >
        <view class="h-11 w-11 flex shrink-0 items-center justify-center rounded-xl bg-[#f6ece1] text-[#7d614a]">
          <view class="text-2xl" :class="categoryIcons[item.key]" />
        </view>
        <text class="min-w-0 flex-1 break-words text-base font-semibold">{{ st(item.title) }}</text>
        <view class="max-w-[45%] flex shrink-0 items-center justify-end gap-1.5">
          <text v-if="item.summary" class="min-w-0 break-words text-right text-sm">{{ t(`shop.orderCenter.pendingStatus.${item.summary.status}`) }}</text>
          <text v-if="item.summary" class="min-w-6 shrink-0 rounded-full bg-[#a33a25] px-1.5 text-center text-sm text-white font-semibold">
            {{ item.summary.count }}
          </text>
          <view class="i-carbon-chevron-right shrink-0 text-xl" />
        </view>
      </button>
      <button v-if="summary.failed" class="col-span-full m-0 bg-white text-sm" @click="summary.refresh()">
        {{ t('shop.orderCenter.retrySummary') }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.order-categories {
  grid-template-columns: minmax(0, 1fr);
}

.order-category {
  border-bottom: 1px solid #eeeae6;
}

.order-category::after {
  border: 0;
}

.order-category-pressed {
  background-color: #faf7f4;
}

@media (min-width: 768px) {
  .order-categories {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
