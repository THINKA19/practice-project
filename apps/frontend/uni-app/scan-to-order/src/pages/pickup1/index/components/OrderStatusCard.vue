<script lang="ts" setup>
/**
 * 订单状态卡：5 种状态共用一张卡（已关闭 / 待支付 / 待取餐 / 配送中 / 已完成）
 *
 * 为什么核销码画布收在本组件：两个需要码的分支是互斥的，所以 `canvas-id="qrcode"` 在页面里唯一；
 * 而 `uni.createCanvasContext` 的 canvas-id 只在**画布所在实例**的作用域内有效 ——
 * 画布进了组件，就必须传本组件的 proxy（原实现画布在页面里，传的是页面 proxy）。
 */
import type { OrderInfo } from '../models/order'
import { computed } from 'vue'
import { t } from '@/locale'

const props = defineProps<{
  /** 订单主体；未加载时为 null，整卡不渲染 */
  orderInfo?: OrderInfo | null
}>()

const emit = defineEmits<{
  /** 点「立即支付」：由页面决定走余额还是微信支付 */
  pay: []
}>()

/** 订单状态 */
const status = computed(() => props.orderInfo?.status)

/** 待取餐（自提） */
const isPickupWaiting = computed(() => status.value === 1 && !props.orderInfo?.isNeedLogistics)
/** 配送中（含待配送） */
const isDelivering = computed(() => (status.value === 1 || status.value === 2) && !!props.orderInfo?.isNeedLogistics)
/** 已完成 */
const isFinished = computed(() => status.value === 3 || status.value === 4)

/** 需要画的核销码：只有需要出示码的两个状态才有（原实现漏了「配送中」那一支，那里会是一块白） */
const qrcodeText = computed(() => {
  if (!props.orderInfo?.hxNumber)
    return ''
  if (isPickupWaiting.value || isDelivering.value)
    return props.orderInfo.hxNumber
  return ''
})
</script>

<template>
  <view class="mb-24rpx overflow-hidden rounded-24rpx shadow-[0_8rpx_24rpx_rgba(139,69,19,0.12)]">
    <!-- 已关闭状态 -->
    <view v-if="status === -1" class="relative flex flex-col items-center bg-[linear-gradient(135deg,#B0B0B0_0%,#808080_100%)] p-60rpx px-40rpx pb-50rpx text-center">
      <view class="mb-24rpx h-140rpx w-140rpx center rounded-full bg-white/20">
        <view class="i-carbon-close text-100rpx text-white" />
      </view>
      <view class="mb-12rpx text-40rpx text-white font-bold tracking-2rpx">
        {{ t('orderDetail.closed') }}
      </view>
      <view class="mt-8rpx text-26rpx text-white/90">
        {{ t('orderDetail.closedTips') }}
      </view>
    </view>

    <!-- 待支付状态 -->
    <view v-else-if="status === 0" class="relative flex flex-col items-center bg-[linear-gradient(135deg,#FFB84D_0%,#FF9500_100%)] p-60rpx px-40rpx pb-50rpx text-center">
      <view class="mb-24rpx h-140rpx w-140rpx center rounded-full bg-white/20">
        <view class="i-carbon-currency-dollar text-100rpx text-white" />
      </view>
      <view class="mb-12rpx text-40rpx text-white font-bold tracking-2rpx">
        {{ t('orderDetail.noPay') }}
      </view>
      <view class="mt-8rpx text-26rpx text-white/90">
        {{ t('orderDetail.noPayTips') }}
      </view>
      <view class="mt-32rpx">
        <view
          class="inline-block rounded-60rpx bg-white px-80rpx py-20rpx text-30rpx text-[#FF9500] font-bold shadow-[0_8rpx_16rpx_rgba(0,0,0,0.15)] transition-transform active:scale-95"
          @click="emit('pay')"
        >
          {{ t('orderDetail.payNow') }}
        </view>
      </view>
    </view>

    <!-- 待取餐状态（自提） -->
    <view v-else-if="isPickupWaiting" class="relative flex flex-col items-center bg-[linear-gradient(135deg,#8B4513_0%,#A0522D_100%)] p-60rpx px-40rpx pb-50rpx text-center">
      <view class="mb-24rpx h-140rpx w-140rpx center rounded-full bg-white/20">
        <view class="i-carbon-shopping-bag text-100rpx text-white" />
      </view>
      <view class="mb-12rpx text-40rpx text-white font-bold tracking-2rpx">
        {{ t('orderDetail.pickingUp') }}
      </view>
      <view class="mb-12rpx mt-24rpx text-28rpx text-white/90">
        {{ t('orderDetail.qudanhao') }}
      </view>
      <view class="my-16rpx text-80rpx text-[#FFE4C4] font-bold tracking-8rpx">
        {{ orderInfo?.qudanhao }}
      </view>
      <view class="mt-32rpx">
        <view class="inline-block rounded-20rpx bg-white p-24rpx shadow-[0_8rpx_20rpx_rgba(0,0,0,0.15)]">
          <wd-qr-code v-if="qrcodeText" :text="qrcodeText" :size="200" />
        </view>
      </view>
      <view class="mt-20rpx text-24rpx text-white/85">
        {{ t('orderDetail.showToStaff') }}
      </view>
    </view>

    <!-- 配送中状态 -->
    <view v-else-if="isDelivering" class="relative flex flex-col items-center bg-[linear-gradient(135deg,#FF8C42_0%,#FF6B35_100%)] p-60rpx px-40rpx pb-50rpx text-center">
      <view class="mb-24rpx h-140rpx w-140rpx center rounded-full bg-white/20">
        <view class="i-carbon-delivery text-100rpx text-white" />
      </view>
      <view class="mb-12rpx text-40rpx text-white font-bold tracking-2rpx">
        {{ t('orderDetail.delivering') }}
      </view>
      <view class="mt-8rpx text-26rpx text-white/90">
        {{ t('orderDetail.deliveringTips') }}
      </view>
      <view class="mt-32rpx">
        <view class="inline-block rounded-20rpx bg-white p-24rpx shadow-[0_8rpx_20rpx_rgba(0,0,0,0.15)]">
          <wd-qr-code v-if="qrcodeText" :text="qrcodeText" :size="200" />
        </view>
      </view>
      <view class="mt-20rpx text-24rpx text-white/85">
        {{ t('orderDetail.showToRider') }}
      </view>
    </view>

    <!-- 已完成状态 -->
    <view v-else-if="isFinished" class="relative flex flex-col items-center bg-[linear-gradient(135deg,#52C41A_0%,#389E0D_100%)] p-60rpx px-40rpx pb-50rpx text-center">
      <view class="mb-24rpx h-140rpx w-140rpx center rounded-full bg-white/20">
        <view class="i-carbon-checkmark-outline text-100rpx text-white" />
      </view>
      <view class="mb-12rpx text-40rpx text-white font-bold tracking-2rpx">
        {{ t('orderDetail.finished') }}
      </view>
      <view class="mt-8rpx text-26rpx text-white/90">
        {{ t('orderDetail.finishedTips') }}
      </view>
    </view>
  </view>
</template>
