<script setup lang="ts">
import type { DoingOrderVM } from '../../../../models/types'
import { useI18n } from 'vue-i18n'

defineProps<{ item: DoingOrderVM, showQrcode?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <!-- 取单号 / 配送卡片 -->
  <view class="pickup-card" :class="{ 'delivery-card': item.order.isNeedLogistics }">
    <view class="card-header">
      <view class="header-icon">
        {{ item.order.isNeedLogistics ? '🚚' : '📋' }}
      </view>
      <view class="header-title">
        {{ item.order.fulfillment === 'preparing' ? t('pickupState.preparing') : item.order.isNeedLogistics ? t('orderDoing.delivering') : t('orderDoing.qudanhao') }}
      </view>
    </view>
    <view v-if="!item.order.isNeedLogistics && item.order.fulfillment !== 'preparing'" class="pickup-number-wrapper">
      <view class="pickup-number">
        {{ item.order.qudanhao }}
      </view>
      <view class="pickup-tips">
        {{ t('orderDoing.pickTips') }}
      </view>
    </view>
    <view v-if="item.order.fulfillment === 'preparing'" class="p-32rpx text-center text-[#8b6f47]">
      {{ t('pickupState.preparingHint') }}
    </view>
    <view v-else class="qrcode-wrapper" :class="{ 'delivery-qrcode': item.order.isNeedLogistics }">
      <view class="qrcode-container">
        <view class="hx-canvas">
          <wd-qr-code v-if="showQrcode && item.order.hxNumber" :text="item.order.hxNumber" :size="200" />
        </view>
        <view class="qrcode-corners">
          <view class="corner corner-tl" />
          <view class="corner corner-tr" />
          <view class="corner corner-bl" />
          <view class="corner corner-br" />
        </view>
      </view>
      <view class="qrcode-label">
        {{ item.order.isNeedLogistics ? t('orderDoing.deliveryQrcodeLabel') : t('orderDoing.qrcodeLabel') }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.pickup-card {
  position: relative;
  padding: 48rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, #fffbf5 100%);
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(139, 111, 71, 0.08);

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 8rpx;
    content: '';
    background: linear-gradient(90deg, #ff9f5a 0%, #6dd0a5 100%);
  }
}

.delivery-card::before {
  background: linear-gradient(90deg, #6dd0a5 0%, #4fb89d 100%);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.header-icon {
  margin-right: 16rpx;
  font-size: 48rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #8b6f47;
}

.pickup-number-wrapper {
  padding: 40rpx 0;
  margin-bottom: 48rpx;
  text-align: center;
  background: linear-gradient(135deg, #fff9f0 0%, #ffede0 100%);
  border-radius: 24rpx;
}

.pickup-number {
  font-size: 96rpx;
  font-weight: 700;
  color: #ff7b3e;
  letter-spacing: 8rpx;
  text-shadow: 0 4rpx 16rpx rgba(255, 123, 62, 0.2);
}

.pickup-tips {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #a89080;
  letter-spacing: 2rpx;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
}

.delivery-qrcode {
  margin-top: 20rpx;
}

.qrcode-container {
  position: relative;
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
}

.hx-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 400rpx;
  height: 400rpx;
}

.qrcode-corners {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-color: #ff9f5a;
  border-style: solid;
}

.corner-tl {
  top: 16rpx;
  left: 16rpx;
  border-width: 6rpx 0 0 6rpx;
  border-radius: 8rpx 0 0;
}

.corner-tr {
  top: 16rpx;
  right: 16rpx;
  border-width: 6rpx 6rpx 0 0;
  border-radius: 0 8rpx 0 0;
}

.corner-bl {
  bottom: 16rpx;
  left: 16rpx;
  border-width: 0 0 6rpx 6rpx;
  border-radius: 0 0 0 8rpx;
}

.corner-br {
  right: 16rpx;
  bottom: 16rpx;
  border-width: 0 6rpx 6rpx 0;
  border-radius: 0 0 8rpx;
}

.qrcode-label {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #a89080;
  letter-spacing: 2rpx;
}
</style>
