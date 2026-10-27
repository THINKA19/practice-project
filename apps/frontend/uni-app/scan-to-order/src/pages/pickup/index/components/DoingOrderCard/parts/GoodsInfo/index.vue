<script setup lang="ts">
import type { DoingOrderVM } from '../../../../models/types'
import { useI18n } from 'vue-i18n'

defineProps<{ item: DoingOrderVM, showQrcode?: boolean }>()
const { t } = useI18n()
</script>

<template>
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
</template>

<style lang="scss" scoped>
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
</style>
