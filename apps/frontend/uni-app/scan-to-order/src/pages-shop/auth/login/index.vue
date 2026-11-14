<script setup lang="ts">
import IdentitySwitch from '@/pages/auth/session/components/IdentitySwitch/index.vue'
import PageLoading from '@/components/page-loading/index.vue'
import { onShow } from '@dcloudio/uni-app'
import { watch } from 'vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import RolePasswordHelp from '@/components/role-password-help/index.vue'
import { useShopLoginPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '商家登录', backgroundColor: '#f5f7f6' } })
const vm = useShopLoginPage()
const { username, password, loading, error, authenticated } = vm
const showDemoAccounts = import.meta.env.DEV && vm.isDemo

function fillCredentials(account: 'shop' | 'shop-staff') {
  if (!showDemoAccounts || loading.value)
    return

  username.value = account
  password.value = '123456'
  error.value = ''
}

onShow(() => uni.setNavigationBarTitle({ title: t('shop.messages.merchantSignIn') }))
watch(() => t('shop.messages.merchantSignIn'), title => uni.setNavigationBarTitle({ title }))
</script>

<template>
  <IdentitySwitch target="shop">
    <view class="role-login box-border flex flex-col px-16px text-[#17392a]">
      <view class="mx-auto max-w-520px w-full">
        <view class="role-login-card box-border rounded-20px bg-white px-20px py-28px">
          <view class="mb-24px text-center text-26px font-bold leading-tight">
            {{ st('商家登录') }}
          </view>
          <template v-if="authenticated">
            <view class="mb-16px">
              {{ st('已登录：') }} {{ vm.session.userInfo.nickname }}
            </view>
            <wd-button block custom-class="!mb-12px" :disabled="loading" @click="vm.enterWorkspace()">
              {{ st('进入商家工作台') }}
            </wd-button>
            <wd-button plain block :disabled="loading" @click="vm.logout">
              <PageLoading v-if="loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
              {{ st('退出当前账号') }}
            </wd-button>
          </template>
          <template v-else>
            <view class="mb-12px">
              <view class="mb-4px text-14px font-medium">
                {{ st('账号') }}
              </view><view class="role-login-field overflow-hidden rounded-10px">
                <wd-input v-model="username" :placeholder="st('请输入商家账号')" :disabled="loading" />
              </view>
            </view>
            <view class="mb-4px text-14px font-medium">
              {{ st('密码') }}
            </view><view class="role-login-field overflow-hidden rounded-10px">
              <wd-input v-model="password" show-password :placeholder="st('请输入密码')" :disabled="loading" />
            </view>
            <RolePasswordHelp :disabled="loading" />
            <wd-button block :disabled="!vm.serviceReady || loading" @click="vm.submit">
              <PageLoading v-if="loading" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
              {{ st('登录商家后台') }}
            </wd-button>
            <view v-if="showDemoAccounts" class="mt-12px flex flex-wrap justify-center rounded-10px bg-[#f2f7f4]">
              <wd-button variant="text" :disabled="loading" @click="fillCredentials('shop')">
                {{ st('填入老板测试账号') }}
              </wd-button>
              <wd-button variant="text" :disabled="loading" @click="fillCredentials('shop-staff')">
                {{ st('填入员工测试账号') }}
              </wd-button>
            </view>
            <view v-if="!vm.serviceReady" class="mt-12px text-center text-13px text-red-700">
              {{ st('商家登录服务尚未配置，请联系管理员。') }}
            </view>
            <view class="role-login-note mt-20px pt-16px text-center text-13px text-[#52635a] leading-relaxed">
              {{ st('账号由管理员分配，如需重置密码请联系管理员。') }}
            </view>
          </template>
          <view v-if="error" class="mt-12px text-center text-13px text-red-700" aria-live="polite">
            {{ st(error) }}
          </view>
        </view>
      </view>
    </view>
  </IdentitySwitch>
</template>

<style scoped src="@/style/role-login.css"></style>
