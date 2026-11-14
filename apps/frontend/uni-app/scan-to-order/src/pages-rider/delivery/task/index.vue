<!-- 本人终态配送记录与配送费汇总。 -->
<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import { t } from '@/locale'
import { formatRiderTime, orderReference, riderIncomeAmounts } from './domain/task.rules'
import { historyPeriods, historyTime, useRiderTaskOrders } from './composables/use-orders'

defineOptions({ name: 'RiderOrderList' })
definePage({ style: { navigationBarTitleText: '配送记录' } })

const { list, period, recordView, orderQuery, summary, cancelledCount, currency, hasMore, loadMore, error, loading, refresh, viewDetail } = useRiderTaskOrders()
const orderViews = ['all', 'done', 'cancelled'] as const
const statusLabels = { all: 'rider.task.allOrders', done: 'rider.task.done', cancelled: 'rider.task.cancelled' } as const
const income = computed(() => riderIncomeAmounts(summary.value, currency.value))

onShow(() => uni.setNavigationBarTitle({ title: t('rider.task.history') }))
</script>

<template>
  <view class="mx-auto box-border max-w-1120px min-h-screen w-full bg-[#FFF8F1] p-16px">
    <view class="mb-12px rounded-12px bg-white p-16px">
      <view class="grid grid-cols-4 gap-4px" role="tablist" :aria-label="t('rider.task.history')">
        <button
          v-for="choice in historyPeriods" :key="choice"
          class="period-tab m-0 min-h-32px min-w-0 flex items-center justify-center rounded-full px-2px py-2px text-12px leading-tight"
          :class="period === choice ? 'bg-[#78350F] text-white' : 'bg-[#F3F4F6] text-[#374151]'"
          role="tab" :aria-selected="period === choice" @click="period = choice"
        >
          {{ t(`rider.task.period.${choice}`) }}
        </button>
      </view>
      <view class="grid grid-cols-3 mt-12px gap-6px border-t border-gray-100 pt-12px text-center">
        <view>
          <text class="block text-12px text-[#6B7280]">{{ t('rider.task.done') }}</text>
          <text class="mt-4px block text-22px text-[#1F2937] font-bold">{{ summary.todayDone }}</text>
        </view>
        <view>
          <text class="block text-12px text-[#6B7280]">{{ t('rider.task.cancelled') }}</text>
          <text class="mt-4px block text-22px text-[#1F2937] font-bold">{{ cancelledCount }}</text>
        </view>
        <view class="min-w-0">
          <text class="block text-12px text-[#6B7280]">{{ t('rider.task.feeTotal') }}</text>
          <text class="mt-4px block break-words text-20px text-[#78350F] font-bold">
            <template v-for="(group, index) in income" :key="group.currency ?? ''">
              <text v-if="index > 0"> / </text>
              <FgPrice :amount="group.currency ? group.amount : undefined" :currency-code="group.currency" amount-unit="settlement" />
            </template>
          </text>
        </view>
      </view>
    </view>

    <view class="mb-12px rounded-12px bg-white p-12px">
      <view class="grid grid-cols-3 gap-4px" role="tablist" :aria-label="t('rider.task.allOrders')">
        <button
          v-for="choice in orderViews" :key="choice"
          class="period-tab m-0 min-h-32px min-w-0 flex items-center justify-center rounded-full px-2px py-2px text-12px leading-tight"
          :class="recordView === choice ? 'bg-[#78350F] text-white' : 'bg-[#F3F4F6] text-[#374151]'"
          role="tab" :aria-selected="recordView === choice" @click="recordView = choice"
        >
          {{ t(statusLabels[choice]) }}
        </button>
      </view>
      <input
        v-model="orderQuery" type="text" class="mt-8px h-40px rounded-8px bg-gray-100 px-10px text-14px"
        :placeholder="t('rider.task.orderSearch')" :aria-label="t('rider.task.orderSearch')"
      >
    </view>

    <view v-if="error" class="mb-12px flex items-center justify-between text-red-700">
      <text>{{ error }}</text>
      <wd-button plain size="small" :disabled="loading" @click="refresh">
        {{ t('rider.workspace.retry') }}
      </wd-button>
    </view>
    <view v-else-if="!list.length" class="flex flex-col items-center gap-8px rounded-12px bg-white px-16px py-24px text-center text-14px text-[#6B7280]">
      <view v-if="!loading" class="i-carbon-document h-24px w-24px" aria-hidden="true" />
      <PageLoading v-if="loading" :title="t('rider.task.loading')" />
      <text v-else>{{ t(`rider.task.recordsEmpty.${recordView}`) }}</text>
    </view>
    <view v-if="list.length" class="grid grid-cols-1 mb-12px gap-12px md:grid-cols-2">
      <view v-for="order in list" :key="order.id" class="min-w-0 rounded-12px bg-white p-16px" @click="viewDetail(order)">
        <view class="flex flex-wrap justify-between gap-8px font-semibold">
          <text class="text-14px">
            {{ formatRiderTime(historyTime(order), order.serviceArea?.timeZone) || t('rider.task.timeMissing') }} · {{ t(`rider.task.${order.status}`) }}
          </text>
          <text v-if="order.status === 'done'" class="shrink-0 text-[#78350F]">
            <FgPrice :amount="order.serviceArea?.currency ? order.deliveryFee : undefined" :currency-code="order.serviceArea?.currency" amount-unit="settlement" />
          </text>
        </view>
        <view class="my-8px break-words text-14px">
          {{ t('rider.task.pickup') }} {{ order.shopName }} → {{ t('rider.task.dropoff') }} {{ order.address }}
        </view>
        <view class="flex items-center justify-between gap-8px text-14px text-[var(--app-text-muted)]">
          <view class="min-w-0 break-all">
            <text>{{ orderReference(order) }}</text>
            <text v-if="order.exception" class="block">{{ t('rider.task.hasException') }}</text>
          </view>
          <button class="m-0 shrink-0 bg-transparent px-8px text-14px text-[var(--app-brand-primary)]" @click.stop="viewDetail(order)">
            {{ t('rider.task.detail') }} ›
          </button>
        </view>
      </view>
    </view>
    <wd-button v-if="hasMore" plain block @click="loadMore">
        <PageLoading v-if="loading" inline indicator-only size="28rpx" />
      {{ t('rider.task.moreHistory') }}
    </wd-button>
  </view>
</template>

<style scoped>
.period-tab::after {
  border: 0;
}
</style>
