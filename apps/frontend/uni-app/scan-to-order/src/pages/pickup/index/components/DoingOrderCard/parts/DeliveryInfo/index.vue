<script setup lang="ts">
import type { DoingOrderVM } from '../../../../models/types'
import { useI18n } from 'vue-i18n'

defineProps<{ item: DoingOrderVM, showQrcode?: boolean }>()
const { t } = useI18n()
</script>

<template>
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
</style>
