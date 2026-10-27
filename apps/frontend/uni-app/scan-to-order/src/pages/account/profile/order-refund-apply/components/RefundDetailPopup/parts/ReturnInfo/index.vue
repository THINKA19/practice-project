<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RefundLogisticsContent } from '../../../../models/types'
import type { RefundApplyRecord } from '@/pages/account/profile/order'

const props = defineProps<{ record: RefundApplyRecord, logisticsContent: RefundLogisticsContent | null }>()
const emit = defineEmits<{ fillLogistics: [] }>()
const { t } = useI18n()
const info = computed(() => props.record.baseInfo)
</script>

<template>
  <!-- 寄回地址 -->
  <view v-if="(info.status2 || 0) > 0" class="back-address-card">
    <view class="address-header">
      <view class="header-icon">
        📦
      </view>
      <text class="header-title">
        {{ t('refund.backAddress') }}
      </text>
    </view>
    <view class="address-content">
      <view class="address-row">
        <text class="address-label">
          {{ t('refund.backAddressName') }}：
        </text>
        <text class="address-text">
          {{ logisticsContent?.linkMan }}
        </text>
      </view>
      <view class="address-row">
        <text class="address-label">
          {{ t('refund.backAddressPhone') }}：
        </text>
        <text class="address-text">
          {{ logisticsContent?.mobile }}
        </text>
      </view>
      <view class="address-row">
        <text class="address-label">
          {{ t('refund.backAddressDetail') }}：
        </text>
        <text class="address-text">
          {{ logisticsContent?.address }}
        </text>
      </view>
    </view>
    <!-- 待填写快递单号 -->
    <view v-if="info.status2 === 1" class="logistics-action">
      <view class="primary-btn" @tap="emit('fillLogistics')">
        {{ t('refund.fillLogistics') }}
      </view>
    </view>
    <!-- 已填写快递信息 -->
    <view v-if="info.status2 === 2" class="logistics-filled">
      <view class="filled-header">
        <view class="filled-icon">
          ✓
        </view>
        <text class="filled-title">
          {{ t('refund.logisticsFilled') }}
        </text>
      </view>
      <view class="filled-content">
        <view class="filled-row">
          <text class="filled-label">
            {{ t('refund.logisticsCompany') }}：
          </text>
          <text class="filled-value">
            {{ logisticsContent?.shipperName }}
          </text>
        </view>
        <view class="filled-row">
          <text class="filled-label">
            {{ t('refund.logisticsNumber') }}：
          </text>
          <text class="filled-value">
            {{ logisticsContent?.trackingNumber }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.back-address-card {
  margin: 24rpx 24rpx 0;
  overflow: hidden;
  background: #fff;
  border-radius: 16rpx;
}

.address-header {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #fffbf8 0%, #fff 100%);
  border-bottom: 2rpx solid #f8f1eb;
}

.header-icon {
  margin-right: 12rpx;
  font-size: 40rpx;
}

.header-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #5a4a3a;
}

.address-content {
  padding: 24rpx 32rpx;
}

.address-row {
  display: flex;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.address-label {
  flex-shrink: 0;
  min-width: 140rpx;
  font-size: 28rpx;
  color: #b8977d;
}

.address-text {
  flex: 1;
  font-size: 28rpx;
  line-height: 40rpx;
  color: #5a4a3a;
}

.logistics-action,
.logistics-filled {
  padding: 0 32rpx 32rpx;
}

.primary-btn {
  width: 100%;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 88rpx;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #e8b899 0%, #cf8e63 100%);
  border-radius: 44rpx;
  box-shadow: 0 8rpx 24rpx rgba(207, 142, 99, 0.3);
}

.filled-header {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  background: #f0f9f0;
  border-radius: 16rpx;
}

.filled-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
  font-size: 24rpx;
  color: #fff;
  background: #52c41a;
  border-radius: 50%;
}

.filled-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #52c41a;
}

.filled-content {
  padding: 20rpx 24rpx;
  background: #fff5f0;
  border-radius: 16rpx;
}

.filled-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.filled-label {
  min-width: 140rpx;
  font-size: 26rpx;
  color: #b8977d;
}

.filled-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #5a4a3a;
}
</style>
