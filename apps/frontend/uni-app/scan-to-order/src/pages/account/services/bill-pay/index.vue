<script setup lang="ts">
import { useBillPayPage } from './composables/use-page'

defineOptions({ name: 'BillPay' })
definePage({ style: { navigationBarTitleText: '优惠买单' } })
const { demo, rechargeSendRules, loading, failed, loaded, amount, paymentShow, money, remark, submitting, bindSave, paymentOk, paymentCancel, appliedRule, ruleStatus, explainRule, loadDiscounts } = useBillPayPage()
onShow(() => {
  void loadDiscounts()
})
</script>

<template>
  <view class="min-h-screen bg-[linear-gradient(180deg,#F8F4F0_0%,#FFF5EB_100%)] p-30rpx px-25rpx pb-40rpx">
    <view class="mb-24rpx rounded-24rpx bg-white p-32rpx text-26rpx text-[#8B6F47]">
      {{ demo ? '演示门店 · 模拟买单，不发生真实扣款' : '门店买单支付尚未开放' }}
    </view>
    <view v-if="failed" class="mb-24rpx text-center text-red-500" @tap="loadDiscounts">
      优惠加载失败，点击重试
    </view>

    <!-- 金额输入卡片 -->
    <view class="relative mb-24rpx overflow-hidden rounded-32rpx bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFAF5_100%)] p-50rpx px-40rpx shadow-[0_12rpx_40rpx_rgba(210,180,140,0.15)]">
      <view class="pointer-events-none absolute h-400rpx w-400rpx rounded-full bg-[radial-gradient(circle,rgba(255,200,124,0.08)_0%,transparent_70%)] -right-50rpx -top-50%" />

      <view class="relative mb-40rpx flex items-center">
        <view class="i-carbon-wallet mr-16rpx animate-pulse text-48rpx text-[#C9935B]" />
        <view class="text-32rpx text-[#8B6F47] font-semibold tracking-1rpx">
          消费金额
        </view>
      </view>

      <view class="relative mb-40rpx flex items-center border-3 border-[#E8C8A0]/30 rounded-24rpx border-solid bg-[linear-gradient(135deg,#FFF9F0_0%,#FFFFFF_100%)] p-40rpx px-50rpx">
        <view class="mr-20rpx text-56rpx text-[#C9935B] font-bold">
          ¥
        </view>
        <input
          v-model="amount"
          class="h-80rpx min-w-0 flex-1 text-48rpx text-[#2C2416] font-bold placeholder:text-28rpx placeholder:text-[#D4B896] placeholder:font-normal"
          type="digit"
          placeholder="请输入消费金额"
          placeholder-style="font-size: 14px; color: #B79B7B; font-weight: normal;"
        >
      </view>

      <wd-button
        custom-style="--wot-button-primary-bg: #C9935B; --wot-button-primary-color: #A67C52; --wot-button-primary-plain-border: #C9935B;"
        block
        size="large"
        custom-class="!h-100rpx !rounded-50rpx !text-36rpx !font-semibold !tracking-2rpx !bg-[linear-gradient(135deg,#D4A574_0%,#C9935B_100%)] !text-white !border-none !shadow-[0_8rpx_24rpx_rgba(201,147,91,0.3)] active:!scale-98"
        :loading="loading"
        :disabled="!demo || !loaded || loading || failed || submitting || paymentShow"
        @click="bindSave"
      >
        <view class="flex items-center justify-center">
          <text>立即买单</text>
          <view class="i-carbon-arrow-right ml-12rpx text-40rpx text-white" />
        </view>
      </wd-button>
    </view>

    <!-- 优惠规则卡片 -->
    <view v-if="rechargeSendRules && rechargeSendRules.length > 0" class="mb-24rpx rounded-32rpx bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFBF7_100%)] p-40rpx shadow-[0_12rpx_40rpx_rgba(210,180,140,0.15)]">
      <view class="mb-32rpx flex items-center justify-between">
        <view class="flex items-center">
          <view class="i-carbon-gift mr-16rpx text-44rpx text-[#C9935B]" />
          <view class="text-32rpx text-[#8B6F47] font-semibold tracking-1rpx">
            优惠列表
          </view>
        </view>
        <view class="animate-[shake_3s_ease-in-out_infinite] rounded-20rpx bg-[linear-gradient(135deg,#FF9A62_0%,#FF7F50_100%)] px-20rpx py-8rpx text-22rpx text-white font-medium shadow-[0_4rpx_12rpx_rgba(255,127,80,0.3)]">
          限时优惠
        </view>
      </view>

      <view class="mb-24rpx text-24rpx text-[#A88560] leading-36rpx">
        输入消费金额后，自动使用最大单条满减
      </view>
      <view class="grid grid-cols-2 gap-20rpx">
        <view
          v-for="item in rechargeSendRules"
          :key="item.id"
          class="relative min-w-0 overflow-hidden border-2 border-[#F5E6D3] rounded-20rpx border-solid bg-[linear-gradient(135deg,#FFF9F0_0%,#FFFFFF_100%)] p-28rpx px-20rpx shadow-[0_4rpx_16rpx_rgba(210,180,140,0.1)]"
          @tap="explainRule(item)"
        >
          <view class="absolute h-100rpx w-100rpx rounded-full bg-[radial-gradient(circle,rgba(255,200,124,0.15)_0%,transparent_70%)] -right-20rpx -top-20rpx" />
          <view class="relative mb-16rpx flex flex-col items-center">
            <view class="text-52rpx text-[#D4A574] font-bold leading-64rpx">
              ¥{{ item.discounts }}
            </view>
            <view class="mt-12rpx text-24rpx text-[#A88560] font-medium leading-36rpx">
              优惠
            </view>
          </view>
          <view class="my-16rpx h-2rpx bg-[linear-gradient(90deg,transparent,#E8D5C4,transparent)]" />
          <view class="relative text-center">
            <text class="text-26rpx text-[#8B6F47] font-medium">满¥{{ item.consume }}可用</text>
            <view class="mt-12rpx text-24rpx text-[#A67C52] leading-36rpx">
              {{ ruleStatus(item) }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 温馨提示 -->
    <view class="flex items-center border-2 border-[#F5E6D3] rounded-24rpx border-solid bg-[linear-gradient(135deg,#FFFBF7_0%,#FFF9F0_100%)] p-32rpx shadow-[0_4rpx_16rpx_rgba(210,180,140,0.08)]">
      <view class="i-carbon-idea mr-20rpx shrink-0 text-40rpx text-[#C9935B]" />
      <view class="flex-1 text-26rpx text-[#A88560] leading-1.6">
        优惠以确认金额为准；模拟买单不会扣除余额或发起微信支付
      </view>
    </view>
  </view>

  <!-- 支付弹层（原 <payment> 组件本项目不存在 → wd-popup 实现） -->
  <wd-popup :model-value="paymentShow" position="bottom" :closable="!submitting" :close-on-click-modal="!submitting" custom-class="!rounded-t-32rpx" @update:model-value="value => { if (!value) paymentCancel() }" @close="paymentCancel">
    <view class="p-48rpx px-32rpx pb-48rpx">
      <view class="mb-32rpx text-center text-34rpx text-[#333333] font-bold">
        优惠买单
      </view>
      <view class="mb-32rpx rounded-24rpx bg-[#F7F8FA] p-40rpx text-center">
        <view class="mb-12rpx text-24rpx text-[#999999]">
          应付金额
        </view>
        <view class="flex items-baseline justify-center">
          <text class="mr-8rpx text-32rpx text-[#5D4037] font-bold">¥</text>
          <text class="text-64rpx text-[#5D4037] font-bold font-mono">{{ money }}</text>
        </view>
        <view class="mt-8rpx text-22rpx text-[#999999]">
          {{ remark }}
        </view>
      </view>
      <view class="flex gap-24rpx">
        <wd-button
          custom-style="--wot-button-primary-bg: #C9935B; --wot-button-primary-color: #A67C52; --wot-button-primary-plain-border: #C9935B;"

          size="large"
          plain block
          custom-class="!h-88rpx !rounded-44rpx !text-30rpx !text-[#C9935B] !border-2 !border-solid !border-[#C9935B] !bg-white"
          @click="paymentCancel"
        >
          取消
        </wd-button>
        <wd-button
          custom-style="--wot-button-primary-bg: #C9935B; --wot-button-primary-color: #A67C52; --wot-button-primary-plain-border: #C9935B;"
          block
          size="large"
          custom-class="!h-88rpx !rounded-44rpx !text-30rpx !font-semibold !bg-[linear-gradient(135deg,#D4A574_0%,#C9935B_100%)] !text-white !border-none !shadow-[0_8rpx_24rpx_rgba(201,147,91,0.3)]"
          :loading="submitting"
          @click="paymentOk"
        >
          确认模拟买单
        </wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
/* 仅保留徽章晃动动画；其余样式全部由 UnoCSS 原子类实现 */
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3rpx);
  }
  75% {
    transform: translateX(3rpx);
  }
}
</style>
