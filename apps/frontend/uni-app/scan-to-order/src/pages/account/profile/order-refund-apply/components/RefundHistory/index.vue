<script setup lang="ts">
/**
 * 我的售后记录列表（纯展示）
 */
import type { RefundApplyRecord } from '@/pages/account/profile/order'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'RefundHistory' })

defineProps<{
  list: RefundApplyRecord[]
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

const { t } = useI18n()
</script>

<template>
  <view class="history-list">
    <view v-for="(item, idx) in list" :key="item.baseInfo.id" class="history-item" @tap="emit('select', idx)">
      <view class="history-goods">
        <image class="goods-image" :src="item.goodInfo?.pic" mode="aspectFill" />
        <view class="goods-info">
          <view class="goods-name">
            {{ item.goodInfo?.goodsName }}
          </view>
          <view class="goods-meta">
            <text class="goods-num">
              x{{ item.baseInfo.number }}
            </text>
            <text class="goods-price">
              ¥{{ item.baseInfo.amount }}
            </text>
          </view>
          <view class="apply-time">
            {{ t('refund.applyTime') }}：{{ item.baseInfo.dateAdd }}
          </view>
        </view>
      </view>
      <view class="history-status">
        <text class="status-text">
          {{ item.baseInfo.statusStr }}
        </text>
        <view class="arrow-icon">
          ›
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.history-list {
  padding: 0 32rpx 24rpx;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f8f1eb;

  &:last-child {
    border-bottom: none;
  }
}

.history-goods {
  display: flex;
  flex: 1;
  margin-right: 24rpx;
}

.goods-image {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #fff5f0 0%, #ffebe0 100%);
  border: 3rpx solid #fff9f5;
  border-radius: 16rpx;
}

.goods-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 20rpx;
}

.goods-name {
  display: -webkit-box;
  overflow: hidden;
  font-size: 28rpx;
  line-height: 40rpx;
  color: #5a4a3a;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.goods-num {
  font-size: 24rpx;
  color: #b8977d;
}

.goods-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #cf8e63;
}

.apply-time {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #b8977d;
}

.history-status {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.status-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #cf8e63;
}

.arrow-icon {
  margin-left: 8rpx;
  font-size: 48rpx;
  line-height: 1;
  color: #e0d3c5;
}
</style>
