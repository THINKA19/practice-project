<script setup lang="ts">
import { ref, watch } from 'vue'
import AuthPageShell from './components/AuthPageShell.vue'
import AgreementConsent from './components/AgreementConsent.vue'
import WechatQrLogin from './components/WechatQrLogin.vue'
import { useLogin } from './composables/useLogin'
import { currentLocale, t } from '@/locale'

definePage({ style: { navigationBarTitleText: '微信登录', disableScroll: true } })
const { agreed, loading, error, ticket, expired, channel, mobileBrowser, demo, init, start, confirmDemo, resume, pause } = useLogin()
onLoad((query) => {
  void init(query)
})
const pageVisible = ref(false)
function setTitle() {
  uni.setNavigationBarTitle({ title: t('auth.wechatLogin') })
}
onShow(() => {
  pageVisible.value = true
  setTitle()
  resume()
})
onHide(() => {
  pageVisible.value = false
  pause()
})
watch(currentLocale, () => {
  if (pageVisible.value)
    setTitle()
})
</script>

<template>
  <AuthPageShell :title="t('auth.wxTitle')">
    <view class="flex flex-col items-center gap-24rpx py-32rpx">
      <wd-icon name="chat" size="56px" color="#169b50" />
      <text class="text-center text-28rpx text-[#8b6f47]">{{ t(channel === 'web' && !mobileBrowser ? 'auth.wxPcHint' : 'auth.wxPhoneHint') }}</text>
      <text v-if="mobileBrowser && !demo" class="text-center text-26rpx text-[#8b6f47]">{{ t('auth.wxOpenWechat') }}</text>
    </view>
    <AgreementConsent v-model="agreed" :disabled="loading || !!ticket" />
    <view v-if="error" role="alert" class="mt-24rpx text-26rpx text-[#d93025]">
      {{ error }}
    </view>
    <wd-button block :disabled="loading" :loading="loading" custom-class="mt-32rpx !bg-[#169b50] !border-0" @click="start">
      {{ t('auth.wechatLogin') }}
    </wd-button>
    <WechatQrLogin v-if="demo && ticket" :ticket="ticket" :expired="expired" :loading="loading" @confirm="confirmDemo" @refresh="start" />
  </AuthPageShell>
</template>
