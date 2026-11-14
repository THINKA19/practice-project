<route lang="json5">
{ layout: 'default', style: { navigationStyle: 'custom', disableScroll: true } }
</route>

<script lang="ts" setup>
import { TEST_ACCOUNT_HINT } from '@/constants/testAccount'
import { USE_MOCK } from '@/http/alova'
import { useAdminLogin, useCaptcha, useNavigation } from './composables'

// 测试账号提示：仅 mock 阶段展示，上线（VITE_USE_MOCK=false）自动隐藏，页面逻辑不变
const showTestAccount = USE_MOCK
const testAccountHint = TEST_ACCOUNT_HINT.merchant

// 登录表单：账号 + 密码（与骑手登录页同一套形态；验证码仅在真实后端开启时才出现）
const { captchaData, refreshCaptcha, stopCaptchaTimer } = useCaptcha()
// 验证码开关由 useCaptcha 提供，登录时必须把采集到的验证码带给后端，故先声明 useCaptcha
const { loginForm, showPassword, loading, handleLogin } = useAdminLogin({
  isCaptchaRequired: () => captchaData.value.captchaEnabled,
})
const { handleForgotPassword, goContactService, goBackClient } = useNavigation()

onShow(() => refreshCaptcha())
onHide(() => stopCaptchaTimer())
onUnload(() => stopCaptchaTimer())
</script>

<template>
  <view class="min-h-100vh bg-[linear-gradient(180deg,#1e7f5c_0%,#155a41_30%,#F4F6F5_30%)] px-40rpx">
    <!-- 返回客户端（自定义导航栏，没有原生返回键） -->
    <view
      class="flex items-center pt-[calc(var(--status-bar-height)+24rpx)] text-26rpx text-white/80"
      @click="goBackClient"
    >
      <view class="i-carbon-arrow-left mr-8rpx h-32rpx w-32rpx" />
      返回客户端
    </view>

    <!-- 品牌头部 -->
    <view class="pb-60rpx pt-40rpx text-center">
      <view class="mx-auto mb-24rpx flex h-140rpx w-140rpx items-center justify-center rounded-40rpx bg-white/15">
        <view class="i-carbon-store h-80rpx w-80rpx text-white" />
      </view>
      <view class="text-40rpx text-white font-bold">
        蜂鸟点餐 · 商家后台
      </view>
      <view class="mt-12rpx text-24rpx text-white/70">
        门店经营数据一站式管理
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
          v-model="loginForm.username"
          type="text"
          maxlength="32"
          placeholder="请输入商家账号"
          placeholder-class="text-[#A8B5AF]"
          class="h-96rpx flex-1 text-28rpx text-[#2f3d36]"
        >
      </view>

      <view class="mb-24rpx flex items-center rounded-20rpx bg-[#F5F7F6] px-24rpx">
        <view class="i-carbon-locked mr-16rpx h-34rpx w-34rpx text-[#8A9A93]" />
        <input
          v-model="loginForm.password"
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

      <!-- 图形验证码：真实后端开启时（captchaEnabled）才出现，mock 阶段静默降级 -->
      <view v-if="captchaData.captchaEnabled" class="mb-24rpx flex items-center rounded-20rpx bg-[#F5F7F6] px-24rpx">
        <view class="i-carbon-security mr-16rpx h-34rpx w-34rpx text-[#8A9A93]" />
        <input
          v-model="loginForm.captcha"
          type="text"
          maxlength="6"
          placeholder="请输入验证码"
          placeholder-class="text-[#A8B5AF]"
          class="h-96rpx flex-1 text-28rpx text-[#2f3d36]"
        >
        <image class="h-64rpx w-180rpx rounded-12rpx bg-white" :src="captchaData.image" mode="aspectFit" @click="refreshCaptcha" />
      </view>

      <view class="mb-40rpx flex items-center justify-between">
        <view class="flex items-center" @click="loginForm.rememberAccount = !loginForm.rememberAccount">
          <view
            class="mr-12rpx h-32rpx w-32rpx"
            :class="loginForm.rememberAccount ? 'i-carbon-checkbox-checked text-[#1e7f5c]' : 'i-carbon-checkbox text-[#A8B5AF]'"
          />
          <text class="text-24rpx text-[#6b7c73]">记住账号</text>
        </view>
        <text class="text-24rpx text-[#1e7f5c]" @click="handleForgotPassword">忘记密码？</text>
      </view>

      <wd-button
        block
        size="large"
        :loading="loading"
        custom-class="!h-92rpx !rounded-46rpx !bg-[linear-gradient(135deg,#2f9c74_0%,#1e7f5c_100%)] !text-white !text-30rpx !font-semibold !border-none"
        @click="handleLogin"
      >
        登录并进入后台
      </wd-button>

      <!-- 测试账号提示：仅 mock 阶段展示（账号密码见 constants/testAccount.ts） -->
      <view v-if="showTestAccount" class="mt-32rpx text-center text-22rpx text-[#A8B5AF]">
        {{ testAccountHint }}
      </view>
    </view>

    <!-- 底部客服 -->
    <view class="mt-48rpx pb-40rpx text-center text-26rpx text-[#6b7c73]" @click="goContactService">
      遇到问题？联系客服
    </view>
  </view>
</template>
