<script setup lang="ts">
import CodeCard from './parts/CodeCard/index.vue'
import DeliveryInfo from './parts/DeliveryInfo/index.vue'
import GoodsInfo from './parts/GoodsInfo/index.vue'
/**
 * 进行中订单卡片（纯展示）：取餐号/配送核销码、配送信息、订单明细
 */
import type { DoingOrderVM } from '../../models/types'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'DoingOrderCard' })

defineProps<{
  item: DoingOrderVM
  /** 是否绘制核销码 */
  showQrcode: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <view class="page-container">
    <CodeCard :item="item" :show-qrcode="showQrcode" />

    <DeliveryInfo :item="item" />

    <GoodsInfo :item="item" />

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
