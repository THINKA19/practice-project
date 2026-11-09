<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/ScanModeBar/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import ScanModeBar from '@/pages/ordering/menu/components/ScanModeBar/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import { useOrderingLocale as useI18n } from '../../composables/use-locale'

/**
 * 扫码点餐模式底部栏（点餐 / 购物车 / 已点）+ 切换外卖悬浮按钮
 */

const emit = defineEmits<{
  cart: []
  ordered: []
  waimai: []
}>()

const { t } = useI18n()
</script>

<template>
  <view class="scan-tabbar">
    <view class="active tab">
      <wd-icon name="store" size="44rpx" />
      <text class="mt-4rpx">{{ t('index.order') }}</text>
    </view>
    <view class="tab" @tap="emit('cart')">
      <image class="h-44rpx w-44rpx" src="/static/images/cart.png" mode="aspectFit" />
      <text class="mt-4rpx">{{ t('cart.title') }}</text>
    </view>
    <view class="tab" @tap="emit('ordered')">
      <wd-icon name="list" size="44rpx" />
      <text class="mt-4rpx">{{ t('index.ordered') }}</text>
    </view>
  </view>
  <view class="float-btn" @tap="emit('waimai')">
    <wd-icon name="send" size="48rpx" color="#e64340" />
    <text>{{ t('index.Delivery') }}</text>
  </view>
</template>

<style lang="scss" scoped>
.scan-tabbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1rpx solid #eee;

  .tab {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    color: #6e6d6b;

    &.active {
      color: #e64340;
    }
  }
}

.float-btn {
  position: fixed;
  right: 32rpx;
  bottom: 400rpx;
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #c09a6b;
  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
  border: 2rpx solid #fff;
  border-radius: 50%;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}
</style>
