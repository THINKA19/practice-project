<script setup lang="ts">
import { ref } from 'vue'
import { USE_MOCK } from '@/http/alova'
import { CLIENT_HOME_URL } from '@/constants/routes'
import { TEST_ACCOUNT_HINT } from '@/constants/testAccount'
import { useRiderAuth } from '../../composables'

definePage({
  style: {
    navigationBarTitleText: '骑手登录',
    navigationBarBackgroundColor: '#1e7f5c',
    navigationBarTextStyle: 'white',
  },
})
defineOptions({ name: 'RiderLogin' })

// 装配骑手登录：账号 + 密码（与商家后台同一套形态，不走手机号验证码）
const { form, loading, login } = useRiderAuth()
const showPassword = ref(false)

// 测试账号提示：仅 mock 阶段展示，上线（VITE_USE_MOCK=false）自动隐藏，页面逻辑不变
const showTestAccount = USE_MOCK
const testAccountHint = TEST_ACCOUNT_HINT.rider

function goClient() {
  uni.switchTab({ url: CLIENT_HOME_URL })
}
</script>

<template>
  <view class="min-h-100vh bg-[linear-gradient(180deg,#1e7f5c_0%,#155a41_30%,#F4F6F5_30%)] px-40rpx">
    <!-- 品牌头部 -->
    <view class="pb-60rpx pt-80rpx text-center">
      <view class="mx-auto mb-24rpx flex h-140rpx w-140rpx items-center justify-center rounded-40rpx bg-white/15">
        <view class="i-carbon-delivery h-80rpx w-80rpx text-white" />
      </view>
      <view class="text-40rpx text-white font-bold">
        骑手端
      </view>
      <view class="mt-12rpx text-24rpx text-white/70">
        登录后即可抢单、配送、查看收益
      </view>
    </view>

    <!-- 登录表单：账号 + 密码 -->
    <view class="rounded-32rpx bg-white p-40rpx shadow-[0_8rpx_32rpx_rgba(21,90,65,0.12)]">
      <view class="mb-32rpx text-30rpx text-[#2f3d36] font-semibold">
        账号登录
      </view>

      <view class="mb-24rpx flex items-center rounded-20rpx bg-[#F5F7F6] px-24rpx">
        <view class="i-carbon-user mr-16rpx h-34rpx w-34rpx text-[#8A9A93]" />
        <input
          v-model="form.username"
          type="text"
          maxlength="32"
          placeholder="请输入骑手账号"
          placeholder-class="text-[#A8B5AF]"
          class="h-96rpx flex-1 text-28rpx text-[#2f3d36]"
        >
      </view>

      <view class="mb-40rpx flex items-center rounded-20rpx bg-[#F5F7F6] px-24rpx">
        <view class="i-carbon-locked mr-16rpx h-34rpx w-34rpx text-[#8A9A93]" />
        <input
          v-model="form.password"
          type="text"
          :password="!showPassword"
          maxlength="32"
          placeholder="请输入密码"
          placeholder-class="text-[#A8B5AF]"
          class="h-96rpx flex-1 text-28rpx text-[#2f3d36]"
        >
        <view
          class="h-36rpx w-36rpx"
          :class="showPassword ? 'i-carbon-view-off text-[#1e7f5c]' : 'i-carbon-view text-[#A8B5AF]'"
          @click="showPassword = !showPassword"
        />
      </view>

      <wd-button
        block
        size="large"
        :loading="loading"
        custom-class="!h-92rpx !rounded-46rpx !bg-[linear-gradient(135deg,#2f9c74_0%,#1e7f5c_100%)] !text-white !text-30rpx !font-semibold !border-none"
        @click="login"
      >
        登录并开始接单
      </wd-button>

      <view v-if="showTestAccount" class="mt-32rpx text-center text-22rpx text-[#A8B5AF]">
        {{ testAccountHint }}
      </view>
    </view>

    <!-- 底部入口 -->
    <view class="mt-48rpx text-center text-26rpx text-[#6b7c73]" @click="goClient">
      返回顾客端
    </view>
  </view>
</template>
