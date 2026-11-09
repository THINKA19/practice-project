<script setup lang="ts">
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / order.vue
 * 页面入口：组装页面状态、生命周期与展示组件，页面仅由路由加载。
 * 【方法与导出清单】
 * - 路由页面。
 * 【综合使用示例】
 * import { ClientRoutes } from '@/pages/routes'
 * // 由页面路由加载 cart/order.vue；页面不作为组件 import。
 * ============================================================================
 */
import { PageState } from '@/components/page-state'
import { PaymentPanel } from '@/pages/ordering/menu-pay'

import { stopPullDownRefresh } from '@/pages/ordering/menu'
/**
 * 扫码点餐已点菜品（View）
 * 来源：bee-master/pages/cart/order.wxml
 */
import { useCartTableOrderPage } from './composables/use-table-order-page'

const { currencySymbol, currencyUnit, currencyName } = useOrderingCurrency()

definePage({
  style: {
    navigationBarTitleText: '',
    enablePullDownRefresh: true,
  },
})

const {
  t,
  orderInfo,
  goodsList,
  paymentShow,
  paySuccess,
  money,
  nextAction,
  init,
  fetchOrder,
  goPayOrder,
  paymentOk,
  paymentCancel,
} = useCartTableOrderPage()

onLoad(() => {
  init()
})

onShow(() => {
  fetchOrder()
})

onPullDownRefresh(async () => {
  await fetchOrder()
  stopPullDownRefresh()
})
</script>

<template>
  <view class="table-order-page">
    <PageState v-if="!paySuccess && !orderInfo" status="empty" :title="t('cart.empty')" />
    <block v-if="!paySuccess && orderInfo">
      <!-- 桌号 -->
      <view class="px-32rpx pb-24rpx pt-32rpx">
        <view class="table-card">
          <view class="mr-24rpx text-56rpx">
            🪑
          </view>
          <view class="flex-1">
            <view class="mb-8rpx text-24rpx text-#8B5A3C opacity-80">
              {{ t('cart.tableNum') }}
            </view>
            <view class="table-number">
              {{ orderInfo.tableCode }}
            </view>
          </view>
        </view>
      </view>
      <!-- 已点菜品标题 -->
      <view class="flex items-center gap-16rpx px-32rpx pb-24rpx pt-40rpx">
        <view class="title-line" />
        <view class="title-text">
          {{ t('cart.ordered') }}
        </view>
        <view class="title-line" />
      </view>
      <!-- 菜品列表 -->
      <view class="mb-24rpx px-32rpx">
        <view v-for="item in goodsList" :key="item.id" class="goods-item">
          <view class="relative mr-24rpx flex-shrink-0">
            <image class="goods-image" :src="item.pic" mode="aspectFill" />
            <view class="status-badge" :class="`status-${item.cyTableStatus}`">
              <text v-if="item.cyTableStatus === 0">
                {{ t('cart.Tobeconfirmed') }}
              </text>
              <text v-if="item.cyTableStatus === 1">
                {{ t('cart.Cooked') }}
              </text>
              <text v-if="item.cyTableStatus === 2">
                {{ t('cart.Served') }}
              </text>
            </view>
          </view>
          <view class="min-w-0 flex flex-1 flex-col justify-between">
            <view class="goods-name">
              {{ item.goodsName }}
            </view>
            <view v-if="item.property" class="goods-property">
              {{ item.property }}
            </view>
            <view class="flex items-end justify-between">
              <view class="price">
                {{ currencySymbol }}{{ item.amount }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
              </view>
              <view class="goods-quantity">
                x{{ item.number }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 价格统计 -->
      <view class="price-summary">
        <view class="summary-item">
          <view class="summary-label">
            {{ t('cart.Numofdishes') }}
          </view>
          <view class="summary-value">
            {{ orderInfo.goodsNumber }} 份
          </view>
        </view>
        <view class="summary-item">
          <view class="summary-label">
            {{ t('cart.Consumptionamount') }}
          </view>
          <view class="summary-value">
            {{ currencySymbol }}{{ orderInfo.amount }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
          </view>
        </view>
        <view class="summary-divider" />
        <view class="summary-item pb-8rpx pt-24rpx">
          <view class="text-32rpx text-#333 font-semibold">
            {{ t('cart.Payableamount') }}
          </view>
          <view class="price text-44rpx">
            {{ currencySymbol }}{{ orderInfo.amountReal }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
          </view>
        </view>
      </view>
      <view class="h-180rpx" />
      <!-- 底部结账栏 -->
      <view class="checkout-bar">
        <view class="flex-1">
          <view class="mb-4rpx text-24rpx text-#999">
            {{ t('PickingUp.total') }}
          </view>
          <view class="price text-40rpx">
            {{ currencySymbol }}{{ orderInfo.amountReal }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
          </view>
        </view>
        <view class="checkout-button" @tap="goPayOrder()">
          <text>{{ t('cart.Check') }}</text>
        </view>
      </view>
    </block>
    <!-- 支付成功 -->
    <view v-if="paySuccess" class="pay-success-page">
      <view class="success-circle">
        <wd-icon name="check" size="120rpx" color="#fff" />
      </view>
      <view class="mb-16rpx text-48rpx text-#333 font-bold">
        {{ t('asset.success') }}
      </view>
      <view class="text-28rpx text-#999">
        感谢您的光临
      </view>
    </view>
    <PaymentPanel
      v-model="paymentShow"
      :money="money"
      :remark="t('payment.maidan')"
      :next-action="nextAction"
      @ok="paymentOk()"
      @cancel="paymentCancel()"
    />
  </view>
</template>

<style lang="scss" scoped>
.table-order-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5eb 0%, #fff 40%);
}

.table-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #ffe4d1 0%, #ffd4b8 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(255 178 130 / 20%);
}

.table-number {
  font-size: 40rpx;
  font-weight: 600;
  color: #5c3d2e;
  letter-spacing: 2rpx;
}

.title-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #e6c4a8 50%, transparent 100%);
}

.title-text {
  padding: 0 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #8b5a3c;
  letter-spacing: 2rpx;
}

.goods-item {
  display: flex;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgb(139 90 60 / 6%);
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
}

.status-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  padding: 8rpx 16rpx;
  font-size: 20rpx;
  font-weight: 500;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgb(0 0 0 / 10%);
}

.status-0 {
  color: #d97706;
  background: linear-gradient(135deg, #fff4e6 0%, #ffe7ba 100%);
}

.status-1 {
  color: #2e7d32;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.status-2 {
  color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.goods-name {
  display: -webkit-box;
  margin-bottom: 8rpx;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #333;
  -webkit-box-orient: vertical;
}

.goods-property {
  margin-bottom: 12rpx;
  overflow: hidden;
  font-size: 24rpx;
  line-height: 1.5;
  color: #999;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  font-size: 36rpx;
  font-weight: 700;
  color: #d97706;
}

.goods-quantity {
  padding: 4rpx 16rpx;
  font-size: 28rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.price-summary {
  padding: 32rpx;
  margin: 24rpx 32rpx;
  background: linear-gradient(135deg, #fff 0%, #fff9f5 100%);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgb(139 90 60 / 6%);
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
}

.summary-label {
  font-size: 28rpx;
  color: #666;
}

.summary-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.summary-divider {
  height: 1rpx;
  margin: 16rpx 0;
  background: linear-gradient(90deg, transparent 0%, #e6c4a8 20%, #e6c4a8 80%, transparent 100%);
}

.checkout-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 24rpx rgb(0 0 0 / 6%);
}

.checkout-button {
  padding: 28rpx 64rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #ff9a62 0%, #ff7a45 100%);
  border-radius: 56rpx;
  box-shadow: 0 8rpx 24rpx rgb(255 122 69 / 30%);

  &:active {
    transform: scale(0.96);
  }
}

.pay-success-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 64rpx 32rpx;
  background: linear-gradient(180deg, #fff5eb 0%, #fff 100%);
}

.success-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 48rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 50%;
  box-shadow: 0 16rpx 48rpx rgb(82 196 26 / 30%);
}
</style>
