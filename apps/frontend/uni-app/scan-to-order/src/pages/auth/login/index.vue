<script setup lang="ts">
import AuthPageShell from './components/AuthPageShell/index.vue'
import AgreementConsent from './components/AgreementConsent/index.vue'
import { useLoginView } from './composables/use-view'

definePage({ style: { navigationBarTitleText: '微信登录', disableScroll: true } })

const { readPrivacyPolicy, readUserAgreement, t, agreed, loading, error, ticket, demo, start, confirmDemo, cancelLogin } = useLoginView()

async function signIn() {
  if (loading.value)
    return

  const previousTicket = ticket.value
  await start()
  if (demo && ticket.value && ticket.value !== previousTicket && !error.value)
    await confirmDemo()
}
</script>

<template>
  <AuthPageShell :title="t('auth.wxTitle')">
    <view class="login-intro">
      <text class="login-hint">
        {{ t('auth.wxAccountHint') }}
      </text>
    </view>
    <AgreementConsent v-model="agreed" :disabled="loading" @read-user="readUserAgreement" @read-privacy="readPrivacyPolicy" />
    <view v-if="error" role="alert" class="mt-24rpx text-26rpx text-[#d93025]">
      {{ error }}
    </view>
    <wd-button block :disabled="loading" :loading="loading" custom-class="mt-32rpx !bg-[#087743] !border-0" @click="signIn">
      {{ t('auth.wechatLogin') }}
    </wd-button>
    <button class="return-button" @tap="cancelLogin">
      暂不登录，返回
    </button>
  </AuthPageShell>
</template>

<style scoped>
.login-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 36rpx;
  text-align: center;
}
.login-hint {
  max-width: 460rpx;
  color: #536760;
  font-size: 26rpx;
  line-height: 1.55;
}
.return-button {
  margin-top: 28rpx;
  padding: 12rpx;
  border-radius: 16rpx;
  background: #f2f3f5;
  color: #666;
  font-size: 30rpx;
}
.return-button::after {
  border: none;
}
</style>
