<script setup lang="ts">
import { readPrivacyPolicy, readUserAgreement } from '../../composables/use-agreement-navigation'
import AgreementConsent from '../AgreementConsent/index.vue'
import { usePanel } from './use-auth-panel'

defineOptions({ name: 'WechatAuthorizationPanel' })

const { visible, agreed, loading, error, demo, open, authorize, webLogin } = usePanel()
defineExpose({ open })
</script>

<template>
  <wd-popup v-model="visible" position="bottom" root-portal :z-index="1000" closable :close-on-click-modal="!loading" custom-style="border-radius: 28rpx 28rpx 0 0;">
    <view>
      <view class="px-40rpx pt-40rpx pb-safe">
        <view class="mb-32rpx text-34rpx text-#333 font-600">
          微信授权登录
        </view>
        <AgreementConsent v-model="agreed" :disabled="loading" @read-user="readUserAgreement" @read-privacy="readPrivacyPolicy" />
        <!-- #ifdef MP-WEIXIN -->
        <button class="authorize-button" :disabled="!agreed || loading" :loading="loading" @tap="authorize">
          授权登录
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <button class="authorize-button" :disabled="!agreed || loading" :loading="loading" @tap="demo ? authorize() : webLogin()">
          授权登录
        </button>
        <!-- #endif -->
        <view v-if="error" role="alert" class="mt-20rpx text-26rpx text-#d93025">
          {{ error }}
        </view>
        <view class="h-40rpx" />
      </view>
    </view>
  </wd-popup>
</template>

<style scoped>
.authorize-button {
  margin-top: 28rpx;
  font-size: 28rpx;
  color: #fff;
  background: #07c160;
  border-radius: 16rpx;
}
.authorize-button::after {
  border: none;
}
</style>
