<script setup lang="ts">
import AuthPageShell from '../components/AuthPageShell.vue'
import AgreementConsent from '../components/AgreementConsent.vue'
import { currentLocale, t } from '@/locale'
import { ref, watch } from 'vue'
import { useRegister } from './composables/useRegister'

definePage({ style: { navigationBarTitleText: '注册', disableScroll: true } })
const { form, agreed, loading, error, completed, init, submit, toLogin } = useRegister()
onLoad(query => init(query))
const setTitle = () => uni.setNavigationBarTitle({ title: t('auth.register') })
const pageVisible = ref(false)
onShow(() => {
  pageVisible.value = true
  setTitle()
})
onHide(() => {
  pageVisible.value = false
})
watch(currentLocale, () => {
  if (pageVisible.value)
    setTitle()
})
</script>

<template>
  <AuthPageShell :title="t('auth.registerTitle')">
    <view class="mb-16rpx mt-24rpx text-28rpx text-[#4a3428]">
      {{ t('auth.account') }}
    </view>
    <wd-input v-model="form.username" :placeholder="t('auth.accountPlaceholder')" :disabled="loading || completed" :maxlength="32" clearable custom-class="rounded-16rpx !bg-[#fff8f0] !p-24rpx" />
    <view class="mb-16rpx mt-24rpx text-28rpx text-[#4a3428]">
      {{ t('auth.password') }}
    </view>
    <wd-input v-model="form.password" :placeholder="t('auth.passwordLength')" :disabled="loading || completed" :maxlength="64" show-password custom-class="rounded-16rpx !bg-[#fff8f0] !p-24rpx" />
    <view class="mb-16rpx mt-24rpx text-28rpx text-[#4a3428]">
      {{ t('auth.confirmPassword') }}
    </view>
    <wd-input v-model="form.confirmPassword" :placeholder="t('auth.confirmPassword')" :disabled="loading || completed" :maxlength="64" show-password custom-class="rounded-16rpx !bg-[#fff8f0] !p-24rpx" @confirm="submit" />
    <AgreementConsent v-model="agreed" :disabled="loading || completed" />
    <view v-if="error" role="alert" class="mt-24rpx text-26rpx text-[#d93025]">
      {{ error }}
    </view>
    <wd-button block :loading="loading" :disabled="loading || completed" custom-class="mt-32rpx !bg-[#8b4513] !border-0" @click="submit">
      {{ t('auth.register') }}
    </wd-button>
    <view class="mt-32rpx text-center text-28rpx text-[#8b4513]" @click="!loading && toLogin()">
      {{ t('auth.goLogin') }}
    </view>
  </AuthPageShell>
</template>
