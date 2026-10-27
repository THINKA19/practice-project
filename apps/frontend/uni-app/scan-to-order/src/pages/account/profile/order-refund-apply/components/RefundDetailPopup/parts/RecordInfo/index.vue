<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RefundApplyRecord } from '@/pages/account/profile/order'

const props = defineProps<{ record: RefundApplyRecord }>()
const emit = defineEmits<{ preview: [current: string] }>()
const { t } = useI18n()
const info = computed(() => props.record.baseInfo)
</script>

<template>
  <!-- 详细信息 -->
  <view class="popup-details">
    <view class="detail-item">
      <text class="detail-label">
        {{ t('refund.applyTime') }}
      </text>
      <text class="detail-value">
        {{ info.dateAdd }}
      </text>
    </view>
    <view class="detail-item">
      <text class="detail-label">
        {{ t('refund.refundType') }}
      </text>
      <text class="detail-value">
        {{ info.typeStr || t(`refund.type${info.type}`) }}
      </text>
    </view>
    <view class="detail-item">
      <text class="detail-label">
        {{ t('refund.logisticsStatus') }}
      </text>
      <text class="detail-value">
        {{ info.logisticsStatusStr || t(`refund.logisticsStatus${info.logisticsStatus || 0}`) }}
      </text>
    </view>
    <view class="detail-item">
      <text class="detail-label">
        {{ t('refund.refundReason') }}
      </text>
      <text class="detail-value">
        {{ info.reason }}
      </text>
    </view>
    <view v-if="info.remark" class="detail-item">
      <text class="detail-label">
        {{ t('refund.refundRemark') }}
      </text>
      <text class="detail-value remark">
        {{ info.remark }}
      </text>
    </view>
  </view>

  <!-- 举证照片 -->
  <view v-if="record.pics?.length" class="popup-photos">
    <view class="photos-title">
      {{ t('refund.proofImages') }}
    </view>
    <view class="photos-grid">
      <image
        v-for="p in record.pics"
        :key="p.pic"
        class="photo-item"
        mode="aspectFill"
        :src="p.pic"
        @tap="emit('preview', p.pic)"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.popup-details {
  padding: 16rpx 32rpx;
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 16rpx;
}

.detail-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f8f1eb;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  flex-shrink: 0;
  width: 160rpx;
  font-size: 28rpx;
  color: #b8977d;
}

.detail-value {
  flex: 1;
  font-size: 28rpx;
  color: #5a4a3a;
  text-align: right;

  &.remark {
    line-height: 40rpx;
    text-align: left;
  }
}

.popup-photos {
  padding: 24rpx 32rpx 32rpx;
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 16rpx;
}

.photos-title {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #5a4a3a;
}

.photos-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -8rpx;
}

.photo-item {
  width: 200rpx;
  height: 200rpx;
  margin: 8rpx;
  background: linear-gradient(135deg, #fff5f0 0%, #ffebe0 100%);
  border: 3rpx solid #fff9f5;
  border-radius: 16rpx;
}
</style>
