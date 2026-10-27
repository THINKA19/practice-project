<script setup lang="ts">
import { computed } from 'vue'
/**
 * 填写寄回快递信息弹窗（纯展示）
 */
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'LogisticsDialog' })

const props = defineProps<{
  modelValue: boolean
  shipperName: string
  trackingNumber: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:shipperName': [value: string]
  'update:trackingNumber': [value: string]
  'submit': []
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const name = computed({
  get: () => props.shipperName,
  set: v => emit('update:shipperName', v),
})

const no = computed({
  get: () => props.trackingNumber,
  set: v => emit('update:trackingNumber', v),
})
</script>

<template>
  <wd-popup v-model="visible" position="center" round custom-style="width: 85%; max-width: 600rpx; border-radius: 24rpx;">
    <view class="logistics-dialog">
      <view class="dialog-header">
        <text class="dialog-title">
          {{ t('refund.fillLogistics') }}
        </text>
        <view class="dialog-close" @tap="visible = false">
          ✕
        </view>
      </view>
      <view class="dialog-content">
        <view class="dialog-tip">
          <text class="tip-icon">
            💡
          </text>
          <text class="tip-text">
            {{ t('refund.logisticsTip') }}
          </text>
        </view>
        <view class="input-group">
          <view class="input-label">
            {{ t('refund.logisticsCompany') }}
          </view>
          <input v-model="name" class="input-field" :placeholder="t('refund.logisticsCompanyPlaceholder')" placeholder-class="input-placeholder">
        </view>
        <view class="input-group">
          <view class="input-label">
            {{ t('refund.logisticsNumber') }}
          </view>
          <input v-model="no" class="input-field" :placeholder="t('refund.logisticsNumberPlaceholder')" placeholder-class="input-placeholder">
        </view>
      </view>
      <view class="dialog-actions">
        <view class="dialog-btn cancel-btn" @tap="visible = false">
          {{ t('common.cancel') }}
        </view>
        <view class="dialog-btn confirm-btn" @tap="emit('submit')">
          {{ t('refund.submitLogistics') }}
        </view>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.logistics-dialog {
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 2rpx solid #f8f1eb;
}

.dialog-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #5a4a3a;
}

.dialog-close {
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

.dialog-content {
  padding: 32rpx;
}

.dialog-tip {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 32rpx;
  background: #fff9f0;
  border-left: 6rpx solid #ff9800;
  border-radius: 16rpx;
}

.tip-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}

.tip-text {
  font-size: 26rpx;
  line-height: 38rpx;
  color: #8b7355;
}

.input-group {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #5a4a3a;

  &::before {
    margin-right: 4rpx;
    color: #cf8e63;
    content: '*';
  }
}

.input-field {
  box-sizing: border-box;
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #5a4a3a;
  background: #fff5f0;
  border: 2rpx solid #f0e6db;
  border-radius: 16rpx;
}

.dialog-actions {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx 32rpx;
}

.dialog-btn {
  flex: 1;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
}

.cancel-btn {
  color: #8b7355;
  background: #f8f1eb;
}

.confirm-btn {
  color: #fff;
  background: linear-gradient(135deg, #e8b899 0%, #cf8e63 100%);
  box-shadow: 0 8rpx 24rpx rgba(207, 142, 99, 0.3);
}
</style>
