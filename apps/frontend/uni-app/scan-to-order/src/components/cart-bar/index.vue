<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】公共组件 / cart-bar/index.vue
 * 展示层：通过属性接收金额、币种与文案，通过事件交由调用方处理购物车与结算。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import CartBar from '@/components/cart-bar/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */

/**
 * 底部购物车条：购物车入口 + 数量徽章、合计金额、去结算 / 获取门店 / 未营业
 */

import type { CartBarProps } from './types'
import { useCartBar } from './use-cart-bar'

const props = defineProps<CartBarProps>()

const emit = defineEmits<{
  toggleCart: []
  pay: []
  getShop: []
}>()

const { badge, mode, loading, disabled, buttonText, openCart, activate } = useCartBar(props, {
  toggleCart: () => emit('toggleCart'),
  pay: () => emit('pay'),
  getShop: () => emit('getShop'),
})
</script>

<template>
  <view class="cart-bar">
    <view class="cart-entry" @tap="openCart">
      <view class="cart-icon">
        <view class="i-carbon-shopping-cart text-40rpx" />
        <view v-if="badge" class="badge">
          {{ badge }}
        </view>
      </view>
      <text>{{ cartText }}</text>
    </view>
    <view class="flex items-center gap-24rpx">
      <view class="amount">
        {{ currencySymbol }}{{ price }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
      </view>
      <view class="topay" :class="{ noopen: mode === 'closed' }" role="button" :aria-disabled="disabled" @tap="activate">
        <wd-loading v-if="loading" size="32rpx" color="#fff" />
        <text v-else>{{ buttonText }}</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cart-bar {
  position: relative;
  z-index: 100;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 120rpx;
  padding: 0 24rpx;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.cart-entry {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  height: 72rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  border: 1rpx solid #ebedf0;
  border-radius: 36rpx;

  .cart-icon {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .badge {
    position: absolute;
    top: -12rpx;
    left: 24rpx;
    min-width: 32rpx;
    height: 32rpx;
    padding: 0 8rpx;
    font-size: 20rpx;
    font-weight: 600;
    line-height: 32rpx;
    color: #fff;
    text-align: center;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
  }
}

.amount {
  font-size: 52rpx;
  font-weight: 700;
  color: #c93636;
}

.topay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220rpx;
  height: 80rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2rpx;
  background: var(--app-brand-primary, #8b4513);
  border-radius: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.16);

  &.noopen {
    color: #6f6258;
    background: #e9e3dc;
    box-shadow: none;
  }
}
</style>
