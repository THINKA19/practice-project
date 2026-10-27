<script setup lang="ts">
import { computed } from 'vue'
import ReturnInfo from './parts/ReturnInfo/index.vue'
import RecordInfo from './parts/RecordInfo/index.vue'
/**
 * 售后详情弹窗（纯展示）
 */
import type { RefundApplyRecord } from '@/pages/account/profile/order'
import type { RefundLogisticsContent } from '../../models/types'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'RefundDetailPopup' })

const props = defineProps<{
  modelValue: boolean
  record: RefundApplyRecord | null
  logisticsContent: RefundLogisticsContent | null
  /** QW 企业微信客服；其他走 open-type="contact" */
  customerServiceType: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'preview': [current: string]
  'cancelApply': []
  'fillLogistics': []
  'customerService': []
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const info = computed(() => props.record?.baseInfo)
const status = computed(() => Number(info.value?.status ?? -1))
const noticeClass = computed(() => (status.value === 4 ? 'success' : status.value === 2 ? 'error' : 'info'))
const noticeIcon = computed(() => ({ 0: '⏱', 2: '✕', 3: '⚙', 4: '✓' } as Record<number, string>)[status.value] || '')
</script>

<template>
  <wd-popup v-model="visible" position="bottom" round custom-style="max-height: 85vh; background: #FFF9F5;">
    <scroll-view v-if="record && info" scroll-y class="popup-scroll">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">
            {{ t('refund.detailTitle') }}
          </text>
          <view class="popup-close" @tap="visible = false">
            ✕
          </view>
        </view>

        <!-- 商品信息 -->
        <view class="popup-goods">
          <image class="popup-goods-image" :src="record.goodInfo?.pic" mode="aspectFill" />
          <view class="popup-goods-info">
            <view class="popup-goods-name">
              {{ record.goodInfo?.goodsName }}
            </view>
            <view class="popup-goods-meta">
              <text class="popup-goods-num">
                x{{ info.number }}
              </text>
              <text class="popup-goods-price">
                ¥{{ info.amount }}
              </text>
            </view>
          </view>
        </view>

        <!-- 状态提示 -->
        <view class="popup-notice" :class="noticeClass">
          <view class="notice-icon">
            {{ noticeIcon }}
          </view>
          <text class="notice-text">
            {{ t(`refund.status.s${status}`) }}
          </text>
        </view>

        <ReturnInfo :record="record" :logistics-content="logisticsContent" @fill-logistics="emit('fillLogistics')" />

        <RecordInfo :record="record" @preview="emit('preview', $event)" />

        <!-- 底部操作 -->
        <view class="popup-actions">
          <view v-if="customerServiceType === 'QW'" class="action-service" @tap="emit('customerService')">
            <text class="service-icon">
              💬
            </text>
            <text class="service-text">
              {{ t('refund.contactService') }}
            </text>
          </view>
          <view v-else class="mb-32rpx">
            <wd-button round block open-type="contact" custom-class="contact-btn">
              {{ t('refund.contactService') }}
            </wd-button>
          </view>
          <view class="action-btn-box">
            <view v-if="status === 0" class="action-btn cancel" @tap="emit('cancelApply')">
              {{ t('refund.cancelApply') }}
            </view>
            <view v-else-if="status >= 1 && status <= 4" class="action-btn disabled" :class="{ success: status === 4 }">
              {{ t(`refund.status.s${status}`) }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.popup-scroll {
  max-height: 85vh;
}

.popup-container {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background: #fff9f5;
}

.popup-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: #fff;
  border-bottom: 2rpx solid #f8f1eb;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #5a4a3a;
}

.popup-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  font-size: 40rpx;
  color: #b8977d;
  background: #fff5f0;
  border-radius: 50%;
}

.popup-goods {
  display: flex;
  padding: 24rpx 32rpx;
  margin-top: 2rpx;
  background: #fff;
}

.popup-goods-image {
  flex-shrink: 0;
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #fff5f0 0%, #ffebe0 100%);
  border: 3rpx solid #fff9f5;
  border-radius: 16rpx;
}

.popup-goods-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: 24rpx;
}

.popup-goods-name {
  font-size: 30rpx;
  font-weight: 500;
  line-height: 42rpx;
  color: #5a4a3a;
}

.popup-goods-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.popup-goods-num {
  font-size: 26rpx;
  color: #b8977d;
}

.popup-goods-price {
  font-size: 36rpx;
  font-weight: 600;
  color: #cf8e63;
}

.popup-notice {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  margin: 24rpx 24rpx 0;
  background: #fff9f0;
  border-left: 6rpx solid #ff9800;
  border-radius: 16rpx;

  &.info {
    background: #e8f4ff;
    border-left-color: #1890ff;
  }

  &.success {
    background: #f0f9f0;
    border-left-color: #52c41a;
  }

  &.error {
    background: #fff1f0;
    border-left-color: #ff4d4f;
  }
}

.notice-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
  font-size: 32rpx;
}

.notice-text {
  flex: 1;
  font-size: 26rpx;
  line-height: 38rpx;
  color: #8b7355;
}

.popup-actions {
  padding: 24rpx 32rpx;
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 16rpx;
}

.action-service {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: #fff5f0;
  border-radius: 16rpx;
}

.service-icon {
  margin-right: 12rpx;
  font-size: 36rpx;
}

.service-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #8b7355;
}

:deep(.contact-btn) {
  color: #8b7355 !important;
  background: #fff5f0 !important;
  border: none !important;
}

.action-btn-box {
  display: flex;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;

  &.cancel {
    color: #fff;
    background: linear-gradient(135deg, #e8b899 0%, #cf8e63 100%);
    box-shadow: 0 8rpx 24rpx rgba(207, 142, 99, 0.3);
  }

  &.disabled {
    color: #c4b5a5;
    background: #f8f1eb;
  }

  &.disabled.success {
    color: #52c41a;
    background: #f0f9f0;
  }
}
</style>
