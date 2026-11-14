<!--
============================================================================
商家订单列表
============================================================================

【文件概述】
展示分类列表和工作台快捷列表。

【方法与导出清单】
- 默认导出：uni-app 页面入口。

【综合使用示例】
```typescript
import { ShopRoutes } from '@/pages-shop/routes'
uni.navigateTo({ url: ShopRoutes.Operations.orderList + '?category=dine-in' })
```
============================================================================
-->
<script lang="ts" setup>
import ListEnd from '@/components/list-end/index.vue'
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { shopText as st } from '@/locale/shop-text'
import { computed, nextTick, ref, watch } from 'vue'
import { t } from '@/locale'
import { onShow } from '@dcloudio/uni-app'
import OrderBookings from './components/OrderBookings.vue'
import { useOrderActions } from '../detail'
import { ShopRoutes } from '@/pages-shop/routes'
import { navigate } from '@/utils/project/navigation'
import { useOrderList } from './composables/useOrderList'
import type { ShopOrder } from './models'
import { SHOP_ORDER_STATUS } from './models/status'
import { orderPendingFilters } from './models/filters'
import { formatOrderTime, orderReference, orderStatusLabel } from './models/presentation'
import { merchantClock, merchantCurrency, useMerchantPage, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeLifecycle } from '@/pages-shop/shop/index'

definePage({
  style: {
    navigationBarTitleText: '订单列表',
    navigationBarBackgroundColor: '#faf7f4',
    backgroundColor: '#faf7f4',
    enablePullDownRefresh: false,
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
const access = useMerchantPage()
useMerchantNoticeLifecycle(access)

const { activeTab, pendingBooking, list, findOrder, error, loading, selected, metric, keyword, dateEnabled, cashierAllowed, tabs, rangeIndex, fromDay, toDay, today, refresh } = useOrderList(access)
const { acceptOrder, finishOrder, cancelOrder, deliverOrder, collectOrder } = useOrderActions(findOrder, refresh)
const context = useMerchantShopStore()
const goDetail = (id: string) => navigate(ShopRoutes.Operations.orderDetail, { id, shopId: context.current?.id })
const dateOptions = computed(() => ['全部日期', '今日', '近7天', '自定义日期'].map((label, value) => ({ label: st(label), value })))
const cashier = computed(() => selected.value?.key === 'cashier')
const bookingAllowed = computed(() => context.can('booking.read'))
const goCenter = () => uni.redirectTo({ url: ShopRoutes.Operations.orders })
const granted = computed(() => access.granted.value)
const paging = ref<{ reload: () => void, complete: (data: false) => void, completeByTotal: (data: ShopOrder[], total: number) => void }>()
const visibleOrders = ref<ShopOrder[]>([])
const calendarOpen = ref(false)
const calendarRange = ref<number[]>([])
const calendarEnd = computed(() => new Date(`${today.value}T23:59:59`).getTime())
const dateLabel = computed(() => rangeIndex.value === 3 ? `${fromDay.value} – ${toDay.value}` : dateOptions.value[rangeIndex.value]?.label)
let pulling = false

function chooseDate(index: number) {
  if (index === 3)
    calendarOpen.value = true
  else
    rangeIndex.value = index
}

function confirmDate({ value }: { value: number[] }) {
  const day = (stamp: number) => {
    const date = new Date(stamp)
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
  }
  fromDay.value = day(value[0])
  toDay.value = day(value[1])
  rangeIndex.value = 3
}

async function queryOrders(page: number, size: number, source: string) {
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
watch(() => context.revision, () => {
  visibleOrders.value = []
  calendarOpen.value = false
}, { flush: 'sync' })
const title = computed(() => selected.value ? st(selected.value.title) : metric.value === 'today' ? st('今日订单') : metric.value === 'pending' ? st('待接单') : st('订单列表'))
const localizedTabs = computed(() => tabs.value.map((tab) => {
  const status = Object.entries(orderPendingFilters).find(([, filter]) => filter === tab)?.[0]
  return { ...tab, title: status ? t(`shop.orderCenter.pendingStatus.${status}`) : st(tab.label) }
}))
const refundLabels = { requested: '待处理退款', processing: '退款中', partial: '部分退款', refunded: '已退款', rejected: '退款已拒绝' }
const cards = computed(() => {
  const clock = merchantClock(context.current)
  return visibleOrders.value.map(item => ({
    ...item,
    reference: cashier.value && item.cashier ? { label: '收银流水号', value: item.cashier.number } : orderReference(item),
    displayTime: formatOrderTime(item.createdAt, Number.isFinite(Date.parse(item.createdAt)) ? clock(new Date(item.createdAt)) : undefined),
  }))
})

onShow(() => uni.setNavigationBarTitle({ title: title.value }))
watch(title, value => uni.setNavigationBarTitle({ title: value }))
</script>

<template>
  <view class="min-h-100vh bg-[#faf7f4]" style="--wot-color-theme: #6b503c; --wot-tabs-nav-bg: #fffdfb; --wot-tabs-nav-line-bg: #6b503c;">
    <PageLoading v-if="!granted" />
    <view v-else-if="!selected && !metric" class="px-24rpx text-center">
      <fg-empty icon="i-carbon-document-blank" :text="st('请选择订单分类')" />
      <wd-button size="small" plain @click="goCenter">
        {{ st('订单中心') }}
      </wd-button>
    </view>
    <fg-empty v-else-if="cashier && !cashierAllowed" icon="i-carbon-locked" :text="st('无权访问收银订单')" />
    <template v-else-if="selected?.key === 'booking'">
      <OrderBookings v-if="bookingAllowed" :active="granted" :pending="pendingBooking" />
      <fg-empty v-else icon="i-carbon-locked" :text="st('无权访问预约订单')" />
    </template>
    <z-paging v-else :key="context.revision" ref="paging" v-model="visibleOrders" :default-page-size="10" hide-empty-view safe-area-inset-bottom @query="queryOrders">
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
        <view class="flex flex-wrap items-center gap-12rpx bg-white px-24rpx py-16rpx">
          <view class="flex flex-[1_1_300rpx] items-center gap-12rpx rounded-20rpx bg-[#f5f1ed] px-20rpx text-[#6b503c]">
            <wd-icon name="search" size="32rpx" />
            <input
              v-model="keyword"
              class="h-72rpx min-w-0 flex-1 text-26rpx"
              :placeholder="st(selected?.search || '桌号 / 取餐号 / 订单尾号')"
              placeholder-style="color: #796b60"
              confirm-type="search"
            >
            <wd-icon v-if="keyword" name="close" size="32rpx" @click="keyword = ''" />
          </view>
          <wd-drop-menu v-if="dateEnabled" custom-style="--wot-color-theme: #6b503c; --wot-drop-menu-height: 72rpx; --wot-drop-menu-list-bg: #f5f1ed; border-radius: 20rpx;">
            <wd-drop-menu-item
              :model-value="rangeIndex"
              :options="dateOptions"
              :title="dateLabel"
              root-portal
              @change="chooseDate(Number($event.value))"
            />
          </wd-drop-menu>
        </view>
        <wd-tabs v-if="!metric" v-model="activeTab" color="#6b503c" line-width="40">
          <wd-tab v-for="tab in localizedTabs" :key="tab.key" :name="tab.key" :title="tab.title" />
        </wd-tabs>
      </template>
      <view v-if="error" class="flex items-center justify-between gap-12rpx p-24rpx">
        <text>{{ st(error) }}</text>
        <wd-button size="small" plain @click="refresh">
          {{ t('common.retry') }}
        </wd-button>
      </view>
      <PageLoading v-if="loading && !visibleOrders.length" />
      <fg-empty v-else-if="!error && !visibleOrders.length" icon="i-carbon-document-blank" :text="st('暂无相关订单')" />
      <!-- 订单列表 -->
      <view v-if="cards.length" class="p-24rpx space-y-24rpx">
        <view
          v-for="item in cards"
          :key="item.id"
          class="rounded-32rpx bg-white p-32rpx shadow-[0_4rpx_20rpx_rgba(139,90,60,0.06)]"
          @click="goDetail(item.id)"
        >
          <!-- 头部：单号 + 桌号/类型 + 状态 + 时间 -->
          <view class="mb-24rpx flex flex-wrap items-center justify-between gap-12rpx">
            <view class="flex items-center">
              <view class="mr-16rpx text-32rpx text-[#17392a] font-semibold">
                {{ st(item.reference.label) }} {{ item.reference.value }}
              </view>
              <text v-if="item.reference.label !== '订单尾号'" class="mr-12rpx text-22rpx text-gray-500">{{ st('订单尾号') }} {{ item.id.slice(-6) }}</text>
              <view class="rounded-full bg-[#FFF5E4] px-16rpx py-4rpx text-22rpx text-[#8B5A3C]">
                {{ st(item.type) }}
              </view>
            </view>
            <view class="flex flex-wrap items-center gap-8rpx">
              <status-tag :meta="SHOP_ORDER_STATUS[item.status]" :text="orderStatusLabel(item)" size="md" />
              <text v-if="item.paymentStatus === 'unpaid' || (cashier && item.paymentStatus === 'paid')" class="text-24rpx text-[#8B5A3C]">
                {{ st(item.paymentStatus === 'paid' ? '已收款' : cashier ? '待收款' : '未支付') }}
              </text>
              <text v-if="item.refundStatus" class="text-24rpx text-[#8B5A3C]">
                {{ st(refundLabels[item.refundStatus]) }}
              </text>
            </view>
          </view>

          <!-- 商品列表 -->
          <view class="mb-24rpx border-y border-[#e5eee8] py-20rpx space-y-12rpx">
            <view v-for="g in item.goods" :key="g.name" class="flex items-center justify-between text-26rpx">
              <view class="text-[#17392a]">
                {{ st(g.name) }}<text class="ml-8rpx text-[#237a50]">×{{ st(g.qty) }}</text>
              </view>
              <view v-if="g.price !== undefined" class="text-[#8B5A3C]">
                <FgPrice :amount="g.price" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" />
              </view>
            </view>
          </view>

          <!-- 备注 -->
          <view v-if="item.remark" class="mb-24rpx rounded-16rpx bg-[#f5f1ed] px-20rpx py-16rpx text-24rpx text-[#8B5A3C]">
            📝 {{ st(item.remark) }}
          </view>

          <!-- 底部：金额 + 操作按钮 -->
          <view class="flex flex-wrap items-center justify-between gap-12rpx">
            <view>
              <text v-if="item.displayTime" class="text-24rpx text-gray-500">{{ item.displayTime }}</text>
              <view v-if="item.amount !== undefined" class="mt-8rpx">
                {{ st('合计') }} <text class="text-24rpx text-[#5A4A42]"><FgPrice :amount="item.amount" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" /></text>
              </view>
            </view>

            <!-- 按钮组（不同状态不同操作） -->
            <view v-if="cashier" @click.stop>
              <wd-button v-if="item.paymentStatus === 'unpaid' && item.status !== 5 && item.status !== 6 && context.can('order.cashier.collect')" size="small" @click="collectOrder(item.id)">
                {{ st('确认线下收款') }}
              </wd-button>
            </view>
            <view v-else class="flex gap-16rpx" @click.stop>
              <!-- 待接单：接单 / 拒单 -->
              <template v-if="item.status === 1">
                <wd-button v-if="context.can('order.cancel')" size="small" custom-class="!rounded-32rpx" plain @click="cancelOrder(item.id)">
                  {{ st('拒单') }}
                </wd-button>
                <wd-button v-if="context.can('order.accept')" size="small" custom-class="!rounded-32rpx !bg-[#16834a] !text-white" @click="acceptOrder(item.id)">
                  {{ st('接单') }}
                </wd-button>
              </template>
              <!-- 制作中：完成出餐 -->
              <template v-else-if="item.status === 2">
                <wd-button v-if="context.can('order.prepare')" size="small" custom-class="!rounded-32rpx !bg-[#4CAF50] !text-white" @click="finishOrder(item.id)">
                  {{ st('完成出餐') }}
                </wd-button>
              </template>
              <!-- 其他：查看详情 -->
              <template v-else>
                <wd-button v-if="item.status === 3 && (item.type === '堂食' || item.type === '自取') && context.can(item.type === '堂食' ? 'order.serve' : 'order.pickup.verify')" size="small" @click="deliverOrder(item.id)">
                  {{ st(item.type === '堂食' ? '确认已上菜' : item.pickupVerificationRequired ? '自取核销' : '确认已取餐') }}
                </wd-button>
                <wd-button v-if="item.type === '外卖' && item.status === 3 && context.can('delivery.read')" size="small" plain @click="navigate(ShopRoutes.Operations.delivery)">
                  {{ st('配送管理') }}
                </wd-button>
                <wd-button size="small" custom-class="!rounded-32rpx" plain @click="goDetail(item.id)">
                  {{ st('查看详情') }}
                </wd-button>
              </template>
            </view>
          </view>
        </view>
      </view>
    </z-paging>
    <wd-calendar
      v-if="dateEnabled && granted"
      v-model="calendarRange"
      v-model:visible="calendarOpen"
      type="daterange"
      :title="st('自定义日期')"
      :max-date="calendarEnd"
      root-portal
      @confirm="confirmDate"
    />
  </view>
</template>
