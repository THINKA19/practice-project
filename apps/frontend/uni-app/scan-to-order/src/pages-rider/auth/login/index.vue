<script setup lang="ts">
import IdentitySwitch from '@/pages/auth/session/components/IdentitySwitch/index.vue'
import PageLoading from '@/components/page-loading/index.vue'
import { onReady } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RolePasswordHelp from '@/components/role-password-help/index.vue'
import { useRiderLoginPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '骑手登录', backgroundColor: '#f5f7f6' } })

const vm = useRiderLoginPage()
const { username, password, loading, error, authenticated, serviceReady } = vm
const { t } = useI18n()

function syncTitle() {
  uni.setNavigationBarTitle({ title: t('rider.login.title') })
}

onReady(syncTitle)
watch(() => t('rider.login.title'), syncTitle)

let wechatAvailable = false
// #ifdef MP-WEIXIN
wechatAvailable = vm.riderWechatLoginAvailable
// #endif

const showPasswordForm = ref(!wechatAvailable)
const testAccount = import.meta.env.DEV && vm.isDemo ? { username: 'rider', password: '123456' } : undefined

function togglePasswordForm() {
  showPasswordForm.value = !showPasswordForm.value
  password.value = ''
  error.value = ''
}

function fillCredentials() {
  if (!testAccount)
    return

  username.value = testAccount.username
  password.value = testAccount.password
  error.value = ''
}
</script>

<template>
  <IdentitySwitch target="rider">
    <view class="role-login box-border flex flex-col px-16px text-[#17392a]">
      <view class="mx-auto max-w-520px w-full">
        <view class="role-login-card box-border rounded-20px bg-white px-20px py-28px">
          <view class="mb-24px text-center text-26px font-bold leading-tight">
            {{ t('rider.login.title') }}
          </view>
          <template v-if="authenticated">
            <view class="mb-16px">
              {{ t('rider.login.signedIn') }}
            </view>
            <wd-button block custom-class="!mb-12px" :disabled="loading" @click="vm.enterWorkspace">
              {{ t('rider.login.workspace') }}
            </wd-button>
            <wd-button plain block :disabled="loading" @click="vm.logout">
              <PageLoading v-if="loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
              {{ t('rider.login.signOut') }}
            </wd-button>
          </template>
          <template v-else>
            <!-- #ifdef MP-WEIXIN -->
            <template v-if="wechatAvailable">
              <button
                v-if="!showPasswordForm"
                class="wechat-login m-0 box-border w-full rounded-8px px-12px py-12px text-16px text-white leading-normal"
                open-type="getPhoneNumber"
                :disabled="loading"
                @getphonenumber="vm.authorizeWechatPhone"
              >
                <PageLoading v-if="loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
                {{ t('rider.login.wechat') }}
              </button>
              <view v-if="!showPasswordForm" class="mt-12px text-center text-13px text-[var(--app-text-muted)]">
                {{ t('rider.login.wechatHint') }}
              </view>
              <view class="mt-12px flex justify-center">
                <wd-button variant="text" :disabled="loading" @click="togglePasswordForm">
                  {{ t(showPasswordForm ? 'rider.login.backToWechat' : 'rider.login.usePassword') }}
                </wd-button>
              </view>
            </template>
            <!-- #endif -->

            <template v-if="showPasswordForm">
              <view class="mb-12px">
                <view class="mb-4px text-14px font-medium">
                  {{ t('rider.login.account') }}
                </view>
                <view class="role-login-field overflow-hidden rounded-10px">
                  <wd-input v-model="username" :placeholder="t('rider.login.accountPlaceholder')" :disabled="loading" />
                </view>
              </view>
              <view class="mb-4px text-14px font-medium">
                {{ t('rider.login.password') }}
              </view>
              <view class="role-login-field overflow-hidden rounded-10px">
                <wd-input v-model="password" show-password :placeholder="t('rider.login.passwordPlaceholder')" :disabled="loading" />
              </view>
              <RolePasswordHelp :disabled="loading" />
              <wd-button block :disabled="!serviceReady || loading" @click="vm.submit">
                <PageLoading v-if="loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
                {{ t('rider.login.signIn') }}
              </wd-button>
              <view v-if="testAccount" class="mt-12px flex justify-center rounded-10px bg-[#f2f7f4]">
                <wd-button variant="text" :disabled="loading" @click="fillCredentials">
                  {{ t('rider.login.fillDemo') }}
                </wd-button>
              </view>
            </template>

            <view v-if="!error && showPasswordForm && !serviceReady" class="mt-12px text-center text-13px text-red-700">
              {{ t('rider.login.serviceUnavailable') }}
            </view>
            <view class="role-login-note mt-20px pt-16px text-center text-13px text-[#52635a] leading-relaxed">
              {{ t('rider.login.storeManaged') }}
            </view>
          </template>
          <view v-if="error" class="mt-12px text-center text-13px text-red-700" aria-live="polite">
            {{ error }}
          </view>
        </view>
      </view>
    </view>
  </IdentitySwitch>
</template>

<style scoped src="@/style/role-login.css"></style>

<style scoped>
.wechat-login {
  background: #067a45;
}

.wechat-login::after {
  border: 0;
}

.wechat-login[disabled] {
  opacity: 0.65;
}
</style>
