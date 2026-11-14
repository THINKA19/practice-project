<script lang="ts" setup>
import FgPrice from '@/components/fg-price/fg-price.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMerchantPage } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeLifecycle } from '@/pages-shop/shop/index'
import { useStatistics } from './composables/index/useStatistics'
import { ORDER_CHANNELS, PERIODS } from './models/index'
import DailyAmountChart from './components/daily-amount-chart/index.vue'

definePage({
  style: {
    disableScroll: true,
    navigationBarTitleText: '数据统计',
  },
})

useMerchantNoticeLifecycle(useMerchantPage())

const {
  activePeriod,
  currency,
  report,
  cumulative,
  cumulativeFailed,
  loading,
  failed,
  canReadAmounts,
  range,
  finance,
  today,
  topGoods,
  trend,
  refresh,
} = useStatistics()

function netReceived(receivedAmount?: number, refundedAmount?: number) {
  return receivedAmount !== undefined && refundedAmount !== undefined
    ? (Math.round(receivedAmount * 100) - Math.round(refundedAmount * 100)) / 100
    : undefined
}

const cumulativeAmounts = computed(() => {
  if (!canReadAmounts.value)
    return []

  const { receivedAmount, refundedAmount } = cumulative.value?.finance ?? {}
  return [
    { key: 'netAmount', amount: netReceived(receivedAmount, refundedAmount) },
    { key: 'receivedAmount', amount: receivedAmount },
    { key: 'refundedAmount', amount: refundedAmount },
  ]
})

const financeCards = computed(() => {
  const { receivedAmount, refundedAmount, pendingAmount } = finance.value ?? {}
  const netAmount = netReceived(receivedAmount, refundedAmount)
  return [
    { key: 'netAmount', amount: netAmount },
    { key: 'receivedAmount', amount: receivedAmount },
    { key: 'refundedAmount', amount: refundedAmount },
    { key: 'pendingAmount', amount: pendingAmount },
  ]
})

function barHeight(value: number, max: number) {
  return max ? `${value / max * 100}%` : '0%'
}

onShow(() => uni.setNavigationBarTitle({ title: t('shop.messages.statistics') }))
watch(() => t('shop.messages.statistics'), title => uni.setNavigationBarTitle({ title }))
</script>

<template>
  <z-paging layout-only safe-area-inset-bottom fixed :use-page-scroll="false" :paging-style="{ background: '#f5f7f6' }">
    <template #top>
      <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-24rpx shadow-sm">
        <view class="text-28rpx text-[#6b503c] font-semibold">
          {{ t(cumulative?.coverage?.fromOpening ? 'shop.statistics.openingTotal' : 'shop.statistics.systemTotal') }}
        </view>
        <view class="mt-2 text-22rpx text-[#52685d]">
          {{ cumulative?.range?.start ? `${cumulative.range.start} – ${cumulative.range.end}` : t(cumulativeFailed ? 'shop.statistics.unavailable' : 'shop.statistics.coverageUnavailable') }}
        </view>
        <view class="grid grid-cols-2 mt-3 gap-3">
          <view v-for="card in cumulativeAmounts" :key="card.key" class="min-w-0 rounded-16rpx bg-[#fcf6ef] p-16rpx">
            <view class="text-22rpx">
              {{ t(`shop.statistics.${card.key}`) }}
            </view>
            <FgPrice v-if="card.amount !== undefined" class="break-all text-32rpx font-bold" :amount="card.amount" :currency-code="currency" amount-unit="settlement" />
            <text v-else>—</text>
          </view>
          <view class="rounded-16rpx bg-[#fcf6ef] p-16rpx">
            <view class="text-22rpx">
              {{ t('shop.statistics.validOrders') }}
            </view>
            <text class="text-32rpx font-bold">{{ cumulative?.overview.orderCount ?? '—' }}</text>
          </view>
        </view>
      </view>
      <view class="bg-white shadow-sm">
        <view class="flex items-center justify-between gap-12rpx px-20rpx py-20rpx">
          <scroll-view scroll-x class="min-w-0 flex-1">
            <view class="inline-flex items-center gap-8rpx whitespace-nowrap">
              <view
                v-for="period in PERIODS"
                :key="period.value"
                class="rounded-full px-16rpx py-10rpx text-24rpx"
                :class="activePeriod === period.value ? 'bg-[#6b503c] text-white shadow' : 'bg-[#fcf6ef] text-[#6b503c]'"
                @click="activePeriod = period.value"
              >
                {{ t(`shop.statistics.${period.label}`) }}
              </view>
            </view>
          </scroll-view>
          <view
            class="h-56rpx w-56rpx flex shrink-0 items-center justify-center"
            :class="{ 'opacity-50': loading }"
            role="button"
            :aria-label="st('刷新')"
            @click="!loading && refresh()"
          >
            <view class="i-carbon-renew h-40rpx w-40rpx text-[#16834a]" />
          </view>
        </view>
        <view class="px-20rpx pb-16rpx text-24rpx text-[#52685d]">
          {{ range.start === range.end ? range.end : `${range.start} – ${range.end}` }}
        </view>
      </view>
    </template>

    <view v-if="loading" class="mt-32rpx text-center text-26rpx">
      {{ t('common.loading') }}
    </view>
    <view v-else-if="failed" class="mt-24rpx rounded-24rpx bg-white p-32rpx text-center text-26rpx">
      <view>{{ t('shop.statistics.loadFailed') }}</view>
      <button class="mt-16rpx text-26rpx" @click="refresh">
        {{ t('common.retry') }}
      </button>
    </view>
    <template v-else-if="report">
      <!-- 核心指标 -->
      <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
        <view class="mb-24rpx flex items-center justify-between">
          <view class="text-28rpx text-[#17392a] font-semibold">
            {{ st('核心指标') }}
          </view>
        </view>
        <view class="grid grid-cols-3 gap-20rpx">
          <view v-if="canReadAmounts && report.overview.revenue !== undefined" class="rounded-24rpx bg-[#FFF5F0] p-24rpx text-center">
            <view class="text-22rpx text-[#237a50]">
              {{ st('订单金额') }}
            </view>
            <view class="mt-12rpx text-40rpx text-[#16834a] font-bold">
              <FgPrice :amount="report.overview.revenue" :currency-code="currency" amount-unit="settlement" />
            </view>
          </view>
          <view class="rounded-24rpx bg-[#E8F5E9] p-24rpx text-center">
            <view class="text-22rpx text-[#237a50]">
              {{ t('shop.statistics.validOrders') }}
            </view>
            <view class="mt-12rpx text-40rpx text-[#4CAF50] font-bold">
              {{ st(report.overview.orderCount) }}
            </view>
          </view>
          <view v-if="canReadAmounts && report.overview.avgCustomerPrice !== undefined" class="rounded-24rpx bg-[#F3E5F5] p-24rpx text-center">
            <view class="text-22rpx text-[#237a50]">
              {{ st('订单均额') }}
            </view>
            <view class="mt-12rpx text-40rpx text-[#9C27B0] font-bold">
              <FgPrice :amount="report.overview.avgCustomerPrice" :currency-code="currency" amount-unit="settlement" />
            </view>
          </view>
          <view v-if="report.overview.unitsSold !== undefined" class="rounded-24rpx bg-[#E3F2FD] p-24rpx text-center">
            <view class="text-22rpx text-[#237a50]">
              {{ t('shop.statistics.unitsSold') }}
            </view>
            <view class="mt-12rpx text-40rpx text-[#2196F3] font-bold">
              {{ report.overview.unitsSold }}
            </view>
          </view>
          <view v-if="report.overview.completedCount !== undefined" class="rounded-24rpx bg-[#FFF8E1] p-24rpx text-center">
            <view class="text-22rpx text-[#237a50]">
              {{ t('shop.statistics.completedCount') }}
            </view>
            <view class="mt-12rpx text-40rpx text-[#B86B00] font-bold">
              {{ report.overview.completedCount }}
            </view>
          </view>
          <view v-if="report.overview.cancelledCount !== undefined" class="rounded-24rpx bg-[#FFEBEE] p-24rpx text-center">
            <view class="text-22rpx text-[#237a50]">
              {{ t('shop.statistics.cancelledCount') }}
            </view>
            <view class="mt-12rpx text-40rpx text-[#D43D37] font-bold">
              {{ report.overview.cancelledCount }}
            </view>
          </view>
        </view>
      </view>
      <view v-if="canReadAmounts" class="mx-24rpx mt-16rpx rounded-32rpx bg-white p-24rpx">
        <view class="mb-16rpx text-30rpx text-[#17392a] font-semibold">
          {{ t('shop.statistics.finance') }}
        </view>
        <view class="grid grid-cols-2 gap-12rpx">
          <view
            v-for="card in financeCards"
            :key="card.key"
            class="min-w-0 rounded-16rpx p-16rpx"
            :class="card.key === 'netAmount' ? 'bg-[#e4f2e9]' : 'bg-[#f5f7f6]'"
          >
            <view class="text-24rpx text-[#17392a]">
              {{ t(`shop.statistics.${card.key}`) }}
            </view>
            <view v-if="card.key === 'pendingAmount'" class="text-20rpx text-[#52685d]">
              {{ t('shop.statistics.asOfNow') }}
            </view>
            <view class="mt-8rpx break-all">
              <FgPrice
                v-if="card.amount !== undefined"
                class="text-32rpx text-[#17392a] font-semibold"
                :amount="card.amount"
                :currency-code="currency"
                amount-unit="settlement"
              />
              <text v-else class="text-24rpx text-[#52685d]">{{ t('shop.statistics.unavailable') }}</text>
            </view>
          </view>
        </view>
        <view v-if="finance?.paidOrderCount !== undefined" class="mt-16rpx flex flex-wrap gap-x-20rpx text-22rpx text-[#52685d]">
          <text>{{ t('shop.statistics.paidOrderCount', { count: finance.paidOrderCount }) }}</text>
          <view v-if="finance.paidOrderCount > 0 && finance.receivedAmount !== undefined">
            {{ t('shop.statistics.averageReceived') }}
            <FgPrice :amount="finance.receivedAmount / finance.paidOrderCount" :currency-code="currency" amount-unit="settlement" />
          </view>
        </view>
      </view>
      <DailyAmountChart
        v-if="canReadAmounts"
        :title="t('shop.statistics.dailyOrderValue')"
        :points="trend"
        :today="today"
        :currency="currency"
      />
      <view class="mx-24rpx my-24rpx">
        <view class="rounded-32rpx bg-white p-32rpx shadow-sm">
          <view class="text-28rpx font-semibold">
            {{ t('shop.statistics.top10') }}
          </view>
          <view v-if="topGoods.length === 0" class="mt-16rpx text-24rpx text-[#52685d]">
            {{ t('shop.statistics.noGoods') }}
          </view>
          <view v-for="(goods, index) in topGoods" :key="goods.rank" class="mt-24rpx flex items-center gap-20rpx">
            <view
              class="h-56rpx w-56rpx flex shrink-0 items-center justify-center rounded-16rpx text-26rpx text-white font-bold"
              :class="{
                'bg-[#FF9800]': index === 0,
                'bg-[#BDBDBD]': index === 1,
                'bg-[#CD7F32]': index === 2,
                'bg-[#E0CFBC]': index > 2,
              }"
            >
              {{ index + 1 }}
            </view>
            <view class="min-w-0 flex-1">
              <view class="mb-8rpx truncate text-26rpx text-[#17392a] font-medium">
                {{ goods.name }}
              </view>
              <view class="flex items-center gap-16rpx">
                <view class="h-16rpx flex-1 overflow-hidden rounded-full bg-[#e5eee8]">
                  <view
                    class="h-full rounded-full bg-[linear-gradient(90deg,#39a86b,#16834a)]"
                    :style="{ width: barHeight(goods.sold, topGoods[0].sold) }"
                  />
                </view>
                <text class="whitespace-nowrap text-22rpx text-[#237a50]">
                  {{ t('shop.statistics.units', { count: goods.sold }) }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="mx-24rpx mb-24rpx rounded-32rpx bg-white p-24rpx shadow-sm">
        <view class="text-28rpx text-[#6b503c] font-semibold">
          {{ t('shop.statistics.orderChannels') }}
        </view>
        <view v-for="channel in ORDER_CHANNELS" :key="channel" class="flex items-center justify-between border-b border-[#f3eae1] py-3 text-26rpx last:border-b-0">
          <text>{{ t(`shop.statistics.channels.${channel}`) }}</text>
          <text class="font-semibold">{{ report.channels?.[channel] ?? '—' }}</text>
        </view>
      </view>
    </template>
  </z-paging>
</template>
