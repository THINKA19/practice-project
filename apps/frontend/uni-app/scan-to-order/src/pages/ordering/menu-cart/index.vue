<script setup lang="ts">
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / index.vue
 * 页面入口：组装页面状态、生命周期与展示组件，页面仅由路由加载。
 * 【方法与导出清单】
 * - 路由页面。
 * 【综合使用示例】
 * import { ClientRoutes } from '@/pages/routes'
 * // 由页面路由加载 cart/index.vue；页面不作为组件 import。
 * ============================================================================
 */
import { stopPullDownRefresh } from '@/pages/ordering/menu'
/**
 * 扫码点餐购物车（View）
 * 来源：bee-master/pages/cart/index.wxml
 */
import type { CartItem } from './models/types'
import { describeCartItem } from './domain/cart.rules'
import { useCartPage } from './composables/use-page'

const { currencySymbol, currencyUnit, currencyName } = useOrderingCurrency()

definePage({
  style: {
    navigationBarTitleText: '',
    enablePullDownRefresh: true,
  },
})

const { t, cart, init, loadCart, changeNumber, clearCart, goCreateOrder, submitting, checkoutReason } = useCartPage()

/** 异步步进（原 van-stepper async-change）：拦截组件内部变更，以接口刷新后的数量为准 */
function beforeChange(item: CartItem) {
  return (value: number | string) => {
    changeNumber(item, Number(value))
    return false
  }
}

onLoad(() => {
  init()
})

onShow(() => {
  loadCart()
})

onPullDownRefresh(async () => {
  await loadCart()
  stopPullDownRefresh()
})

function showSelection(item: CartItem) {
  uni.showModal({
    title: item.name,
    content: [item.name, describeCartItem(item)].filter(Boolean).join('\n'),
    showCancel: false,
  })
}
</script>

<template>
  <view class="cart-container">
    <text v-if="checkoutReason" class="block p-24rpx text-26rpx text-[#777]">{{ checkoutReason }}。可继续选购，价格与库存以结算时为准。</text>
    <!-- 空状态 -->
    <view v-if="!cart" class="empty-state">
      <view class="empty-icon">
        🛒
      </view>
      <view class="mb-16rpx text-32rpx text-#999 font-medium">
        {{ t('cart.empty') }}
      </view>
      <view class="text-26rpx text-#bbb">
        去添加您喜欢的饮品吧
      </view>
    </view>
    <block v-else>
      <!-- 顶部操作栏 -->
      <view class="cart-header">
        <view class="flex items-center gap-12rpx">
          <view class="text-36rpx">
            ☕
          </view>
          <view class="text-34rpx text-#333 font-semibold">
            购物袋
          </view>
          <view class="item-count">
            {{ cart.number }}件
          </view>
        </view>
        <view class="clear-btn" @tap="clearCart()">
          <wd-icon name="delete" size="16px" color="#999" />
          <text>{{ t('cart.clear') }}</text>
        </view>
      </view>
      <!-- 商品列表 -->
      <view class="px-24rpx">
        <view v-for="item in cart.items" :key="item.key" class="item-card">
          <view class="item-image">
            <image :src="item.pic" mode="aspectFill" class="h-full w-full" />
          </view>
          <view class="min-w-0 flex-1">
            <view class="goods-name" role="button" @tap="showSelection(item)">
              {{ item.name }}
            </view>
            <view v-if="describeCartItem(item)" class="goods-specs" role="button" @tap="showSelection(item)">
              {{ describeCartItem(item) }}
            </view>
            <view class="item-controls">
              <view class="item-price">
                {{ currencySymbol }}{{ item.price }}{{ currencyUnit }}
              </view>
              <wd-input-number
                :model-value="item.number"
                :min="0"
                disable-input
                :before-change="beforeChange(item)"
              />
            </view>
          </view>
        </view>
      </view>
      <view class="h-180rpx" />
      <!-- 底部结算栏 -->
      <view class="submit-bar">
        <view class="flex items-center justify-between px-32rpx py-24rpx">
          <view class="flex-1">
            <view class="mb-8rpx text-24rpx text-#999">
              合计
            </view>
            <view class="mb-4rpx flex items-baseline">
              <text class="text-48rpx text-#c93636 font-bold">{{ currencySymbol }}{{ cart.price }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text></text>
            </view>
            <view class="text-22rpx text-#999">
              共{{ cart.number }}{{ t('cart.num') }}
            </view>
          </view>
          <view class="submit-btn" :style="checkoutReason || submitting ? { background: '#999' } : undefined" role="button" :aria-disabled="!!checkoutReason || submitting" @tap="!checkoutReason && !submitting && goCreateOrder()">
            <text>{{ checkoutReason ? '暂不可下单' : submitting ? '正在提交…' : t('cart.btn') }}</text>
            <wd-icon name="arrow-right" color="#fff" size="16px" />
          </view>
        </view>
      </view>
    </block>
  </view>
</template>

<style lang="scss" scoped>
.cart-container {
  min-height: 100vh;
  padding-bottom: 20rpx;
  background: linear-gradient(180deg, #faf8f5 0%, #f5f1eb 100%);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  text-align: center;
}

.empty-icon {
  margin-bottom: 30rpx;
  font-size: 120rpx;
  opacity: 0.6;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0ebe5;
}

.item-count {
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #d4a574 0%, #c89860 100%);
  border-radius: 20rpx;
}

.clear-btn {
  display: flex;
  gap: 8rpx;
  align-items: center;
  padding: 8rpx 20rpx;
  font-size: 26rpx;
  color: #999;
  background: #f8f6f3;
  border-radius: 30rpx;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgb(212 165 116 / 8%);
}

.item-image {
  flex-shrink: 0;
  width: 96rpx;
  height: 96rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f6f3 0%, #f0ebe5 100%);
  border-radius: 20rpx;
}

.goods-name {
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 12rpx;
  overflow: hidden;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #333;
}

.goods-specs {
  font-size: 24rpx;
  line-height: 1.5;
  color: #999;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 12rpx;
}

.item-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #c93636;
  overflow-wrap: anywhere;
}

.submit-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgb(0 0 0 / 8%);
}

.submit-btn {
  display: flex;
  gap: 8rpx;
  align-items: center;
  padding: 24rpx 60rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  background: var(--app-brand-primary, #8b4513);
  border-radius: 50rpx;
  box-shadow: 0 4rpx 12rpx rgb(139 69 19 / 16%);

  &:active {
    transform: scale(0.96);
  }
}
</style>
