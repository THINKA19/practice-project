<script setup lang="ts">
defineOptions({ name: 'CouponPwdDialog' })
/**
 * 领取口令券时输入口令的弹窗（纯展示）
 */
defineProps<{
  modelValue: string
  title: string
  confirmText: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'close': []
  'confirm': []
}>()

function onInput(e: { detail: { value: string } }) {
  emit('update:modelValue', e.detail.value)
}
</script>

<template>
  <view class="pwd-mask" @tap="emit('close')" />
  <view class="pwd-dialog">
    <view class="pwd-dialog-header">
      <view class="text-center text-34rpx text-#333 font-600">
        {{ title }}
      </view>
      <view class="pwd-dialog-close" @tap="emit('close')">
        ✕
      </view>
    </view>
    <view class="px-40rpx py-48rpx">
      <input
        class="pwd-input"
        :value="modelValue"
        placeholder="请输入优惠券密码"
        auto-focus
        @input="onInput"
      >
    </view>
    <view class="pwd-dialog-footer">
      <view class="pwd-cancel-btn" @tap="emit('close')">
        取消
      </view>
      <view class="pwd-confirm-btn" @tap="emit('confirm')">
        {{ confirmText }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.pwd-mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  background: rgb(0 0 0 / 50%);
}

.pwd-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1000;
  width: 600rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  transform: translate(-50%, -50%);
}

.pwd-dialog-header {
  position: relative;
  padding: 48rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.pwd-dialog-close {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  font-size: 36rpx;
  color: #999;
}

.pwd-input {
  box-sizing: border-box;
  width: 100%;
  height: 96rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
  color: #333;
  background: #f7f8fa;
  border-radius: 16rpx;
}

.pwd-dialog-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.pwd-cancel-btn,
.pwd-confirm-btn {
  flex: 1;
  padding: 32rpx 0;
  font-size: 32rpx;
  text-align: center;
}

.pwd-cancel-btn {
  color: #999;
  border-right: 1rpx solid #f0f0f0;
}

.pwd-confirm-btn {
  font-weight: 600;
  color: #d4a574;
}
</style>
