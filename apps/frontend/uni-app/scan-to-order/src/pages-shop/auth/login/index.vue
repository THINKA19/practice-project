<script setup lang="ts">
import { useShopLoginPage } from './composables/useShopLoginPage'

definePage({ style: { navigationBarTitleText: '商家登录' } })
const vm = useShopLoginPage()
const { username, password, loading, error, authenticated } = vm
</script>

<template>
  <view class="min-h-screen bg-#f7f8fa p-32rpx">
    <view class="mb-24rpx text-36rpx font-600">
      商家登录
    </view>
    <view v-if="authenticated" class="rounded-16rpx bg-white p-28rpx">
      <view class="mb-24rpx">
        已登录：{{ vm.session.userInfo.nickname }}
      </view>
      <wd-button block @click="vm.logout">
        退出登录
      </wd-button>
    </view>
    <view v-else>
      <view class="mb-24rpx">
        {{ vm.isDemo ? '模拟账号：shop，密码：123456' : vm.serviceReady ? '请输入商家账号和密码' : '登录服务暂未开放' }}
      </view>
      <wd-input v-model="username" label="账号" placeholder="请输入账号" />
      <wd-input v-model="password" label="密码" show-password placeholder="请输入密码" />
      <wd-button class="mt-24rpx" :disabled="!vm.serviceReady" :loading="loading" block @click="vm.submit">
        登录
      </wd-button>
    </view>
    <view v-if="error" class="mt-24rpx text-red-500">
      {{ error }}
    </view>
    <wd-button class="mt-24rpx" plain block @click="vm.apply">
      申请商家入驻
    </wd-button>
  </view>
</template>
