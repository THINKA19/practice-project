<script setup lang="ts">
/**
 * 商家入驻申请：姓名、电话、店铺照片（最多 9 个）、申请说明
 */
import { useI18n } from 'vue-i18n'
import { JOIN_APPLY_MAX_PICS, useOnboardingPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '',
  },
})

const { t } = useI18n()
const vm = useOnboardingPage()
const { name, mobile, content, picsList, submitting } = vm

onLoad(() => {
  vm.init()
})
</script>

<template>
  <view class="join-apply-container">
    <view class="header-decoration">
      <view class="bubble bubble-1" />
      <view class="bubble bubble-2" />
      <view class="bubble bubble-3" />
    </view>

    <view class="welcome-section">
      <view class="mb-24rpx text-100rpx">
        🍵
      </view>
      <view class="welcome-title">
        商家入驻申请
      </view>
      <view class="text-26rpx text-#8B6F47">
        加入我们，开启您的甜蜜事业
      </view>
    </view>

    <view class="form-card">
      <view class="form-section">
        <view class="section-title">
          <view class="title-line" />
          <text class="title-text">
            基本信息
          </text>
          <view class="title-line" />
        </view>
        <view class="field-item">
          <view class="field-label">
            <text class="label-icon">
              👤
            </text>
            <text class="label-text">
              {{ t('merchantOnboarding.name') }}
            </text>
            <text class="required-mark">
              *
            </text>
          </view>
          <wd-input v-model="name" :placeholder="t('merchantOnboarding.namePlaceholder')" clearable custom-class="field-input" />
        </view>
        <view class="field-item">
          <view class="field-label">
            <text class="label-icon">
              📱
            </text>
            <text class="label-text">
              {{ t('merchantOnboarding.mobile') }}
            </text>
            <text class="required-mark">
              *
            </text>
          </view>
          <wd-input v-model="mobile" type="number" :placeholder="t('merchantOnboarding.mobilePlaceholder')" clearable custom-class="field-input" />
        </view>
      </view>

      <view class="form-section">
        <view class="section-title">
          <view class="title-line" />
          <text class="title-text">
            店铺资料
          </text>
          <view class="title-line" />
        </view>
        <view class="field-item">
          <view class="field-label">
            <text class="label-icon">
              📸
            </text>
            <text class="label-text">
              店铺照片
            </text>
            <text class="field-tip">
              （营业执照、店铺照片等）
            </text>
          </view>
          <view class="uploader-wrapper">
            <wd-upload
              v-model:file-list="picsList"
              accept="media"
              multiple
              :limit="JOIN_APPLY_MAX_PICS"
              :auto-upload="false"
              image-mode="aspectFill"
            />
          </view>
        </view>
        <view class="field-item">
          <view class="field-label">
            <text class="label-icon">
              ✍️
            </text>
            <text class="label-text">
              申请说明
            </text>
            <text class="required-mark">
              *
            </text>
          </view>
          <wd-textarea v-model="content" :placeholder="t('merchantOnboarding.contentPlaceholder')" auto-height custom-class="field-textarea" custom-textarea-class="min-h-200rpx" />
        </view>
      </view>

      <view class="tips-section">
        <view class="mb-20rpx text-28rpx text-#5D3A1A font-600">
          💡 温馨提示
        </view>
        <view class="tips-item">
          • 请确保提供的信息真实有效
        </view>
        <view class="tips-item">
          • 我们将在1-3个工作日内审核您的申请
        </view>
        <view class="tips-item">
          • 审核结果将通过短信或站内消息通知
        </view>
      </view>
    </view>

    <view class="submit-section">
      <view class="submit-button" :class="{ 'opacity-60': submitting }" @tap="vm.bindSave()">
        提交入驻申请
      </view>
    </view>

    <view class="relative z-10 mt-40rpx px-30rpx text-center">
      <text class="text-24rpx text-#8B6F47 opacity-70">
        期待与您携手共创美好未来
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.join-apply-container {
  position: relative;
  min-height: 100vh;
  padding-bottom: 40rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe4d6 50%, #fff8f0 100%);
}

.header-decoration {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 400rpx;
  overflow: hidden;
}

.bubble {
  position: absolute;
  background: rgb(255 255 255 / 30%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.bubble-1 {
  top: 50rpx;
  left: 30rpx;
  width: 120rpx;
  height: 120rpx;
}

.bubble-2 {
  top: 150rpx;
  right: 40rpx;
  width: 180rpx;
  height: 180rpx;
  animation-delay: 2s;
}

.bubble-3 {
  top: 280rpx;
  left: 50%;
  width: 90rpx;
  height: 90rpx;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    opacity: 0.5;
    transform: translateY(0) scale(1);
  }

  50% {
    opacity: 0.8;
    transform: translateY(-30rpx) scale(1.1);
  }
}

.welcome-section {
  position: relative;
  z-index: 10;
  padding: 60rpx 0 50rpx;
  text-align: center;
}

.welcome-title {
  margin-bottom: 16rpx;
  font-size: 48rpx;
  font-weight: bold;
  color: #5d3a1a;
  letter-spacing: 2rpx;
}

.form-card {
  position: relative;
  z-index: 10;
  padding: 40rpx 30rpx;
  margin: 0 30rpx;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgb(93 58 26 / 8%);
}

.form-section {
  margin-bottom: 50rpx;
}

.section-title {
  display: flex;
  gap: 20rpx;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.title-line {
  flex: 1;
  max-width: 120rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #d4a574, transparent);
}

.title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #5d3a1a;
  white-space: nowrap;
}

.field-item {
  margin-bottom: 32rpx;
}

.field-label {
  display: flex;
  align-items: center;
  padding-left: 8rpx;
  margin-bottom: 16rpx;
}

.label-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
}

.label-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.required-mark {
  margin-left: 6rpx;
  font-size: 28rpx;
  color: #ff6b6b;
}

.field-tip {
  margin-left: 8rpx;
  font-size: 22rpx;
  color: #999;
}

:deep(.field-input),
:deep(.field-textarea) {
  padding: 20rpx 24rpx !important;
  background: #f8f8f8 !important;
  border-radius: 16rpx;
}

.uploader-wrapper {
  padding: 20rpx;
  background: #fafafa;
  border: 2rpx dashed #e0e0e0;
  border-radius: 16rpx;
}

.tips-section {
  padding: 30rpx;
  margin-top: 40rpx;
  background: linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%);
  border-left: 6rpx solid #d4a574;
  border-radius: 20rpx;
}

.tips-item {
  padding-left: 8rpx;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  line-height: 40rpx;
  color: #666;
}

.submit-section {
  position: relative;
  z-index: 10;
  margin: 50rpx 30rpx 30rpx;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 4rpx;
  background: linear-gradient(135deg, #d4a574 0%, #a67c52 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgb(164 124 82 / 30%);
}
</style>
