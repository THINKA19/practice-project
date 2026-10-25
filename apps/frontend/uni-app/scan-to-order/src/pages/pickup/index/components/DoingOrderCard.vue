<script setup lang="ts">
/**
 * 进行中订单卡片（纯展示）：取餐号/配送核销码、配送信息、订单明细
 */
import type { DoingOrderVM } from '../models/view'
import { useI18n } from 'vue-i18n'

defineProps<{
  item: DoingOrderVM
  /** 是否绘制核销码 */
  showQrcode: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <view class="page-container">
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

    <!-- 配送信息 -->
    <view v-if="item.logistics" class="info-card">
      <view class="card-section-title">
        <view class="title-icon">
          📍
        </view>
        <text>{{ t('orderDoing.logisticsInfo') }}</text>
      </view>
      <view class="address-content">
        <view class="address-contact">
          <text class="contact-name">
            {{ item.logistics.linkMan }}
          </text>
          <text class="contact-phone">
            {{ item.logistics.mobile }}
          </text>
        </view>
        <view class="address-detail">
          {{ item.address }}
        </view>
      </view>
    </view>

    <!-- 订单明细 -->
    <view class="info-card">
      <view class="card-section-title">
        <view class="title-icon">
          📝
        </view>
        <text>{{ t('orderDoing.orderDetail') }}</text>
      </view>
      <view class="goods-list">
        <view v-for="goods in item.goods" :key="goods.id" class="goods-item">
          <view class="goods-main">
            <view class="goods-name">
              {{ goods.goodsName }}
            </view>
            <view v-if="goods.property" class="goods-specs">
              {{ goods.property }}
            </view>
          </view>
          <view class="goods-right">
            <view class="goods-quantity">
              x{{ goods.number }}
            </view>
            <view class="goods-price">
              ¥{{ goods.amount }}
            </view>
          </view>
        </view>
      </view>
      <view class="divider-line" />
      <view class="total-row">
        <view class="total-label">
          {{ t('orderDoing.total') }}
        </view>
        <view class="total-amount">
          ¥{{ item.order.amountReal }}
        </view>
      </view>
      <view class="order-time">
        <text class="time-icon">
          🕐
        </text>
        <text>{{ t('orderDoing.dateAdd') }}: {{ item.order.dateAdd }}</text>
      </view>
    </view>

    <view class="bottom-decoration">
      <view class="decoration-line" />
      <view class="decoration-text">
        {{ t('orderDoing.footer') }}
      </view>
      <view class="decoration-line" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  box-sizing: border-box;
  min-height: 100%;
  padding: 40rpx 30rpx 60rpx;
}

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

.info-card {
  padding: 40rpx;
  margin-bottom: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(139, 111, 71, 0.06);
}

.card-section-title {
  display: flex;
  align-items: center;
  padding-bottom: 20rpx;
  margin-bottom: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #5d4e3c;
  border-bottom: 2rpx solid #f5f0ea;
}

.title-icon {
  margin-right: 12rpx;
  font-size: 40rpx;
}

.address-content {
  padding: 24rpx;
  background: linear-gradient(135deg, #fff9f0 0%, #ffede0 100%);
  border-radius: 16rpx;
}

.address-contact {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.contact-name {
  margin-right: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #5d4e3c;
}

.contact-phone {
  font-size: 28rpx;
  color: #8b6f47;
}

.address-detail {
  font-size: 28rpx;
  line-height: 44rpx;
  color: #a89080;
}

.goods-list {
  margin-bottom: 24rpx;
}

.goods-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f0ea;

  &:last-child {
    border-bottom: none;
  }
}

.goods-main {
  flex: 1;
  margin-right: 24rpx;
}

.goods-name {
  margin-bottom: 8rpx;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 42rpx;
  color: #5d4e3c;
}

.goods-specs {
  margin-top: 4rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #a89080;
}

.goods-right {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.goods-quantity {
  min-width: 60rpx;
  font-size: 28rpx;
  color: #8b6f47;
  text-align: right;
}

.goods-price {
  min-width: 100rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #ff7b3e;
  text-align: right;
}

.divider-line {
  height: 2rpx;
  margin: 24rpx 0;
  background: linear-gradient(90deg, transparent 0%, #f5f0ea 50%, transparent 100%);
}

.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, #fff9f0 0%, #ffede0 100%);
  border-radius: 16rpx;
}

.total-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #5d4e3c;
}

.total-amount {
  font-size: 44rpx;
  font-weight: 700;
  color: #ff7b3e;
}

.order-time {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  font-size: 24rpx;
  color: #a89080;
}

.time-icon {
  margin-right: 8rpx;
  font-size: 28rpx;
}

.bottom-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
  margin-top: 40rpx;
}

.decoration-line {
  flex: 1;
  max-width: 120rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #e5d5c5 50%, transparent 100%);
}

.decoration-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  font-weight: 300;
  color: #c4b5a8;
  letter-spacing: 2rpx;
}
</style>
