<script lang="ts" setup>
/**
 * 配送卡（配送单）：配送核销二维码
 *
 * 与 PickupCodeCard 是「同类但不同形态」的两张卡（配送单没有取单号），
 * 沿用 card 页 GiftCardItem / MyGiftCardItem 的做法各写一份，不做带 if 的合体组件。
 */
import { t } from '@/locale'

defineProps<{
  /** 核销码内容 */
  hxNumber: string
}>()
</script>

<template>
  <view class="relative mb-32rpx overflow-hidden rounded-32rpx bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFBF5_100%)] p-48rpx shadow-[0_8rpx_32rpx_rgba(139,111,71,0.08)]">
    <view class="absolute left-0 right-0 top-0 h-8rpx bg-[linear-gradient(90deg,#6DD0A5_0%,#4FB89D_100%)]" />

    <view class="mb-40rpx flex items-center">
      <view class="i-carbon-delivery mr-16rpx text-48rpx text-[#4FB89D]" />
      <view class="text-36rpx text-[#8B6F47] font-semibold">
        {{ t('orderDoing.delivering') }}
      </view>
    </view>

    <view class="mt-20rpx flex flex-col items-center">
      <view class="relative rounded-24rpx bg-white p-32rpx shadow-[0_8rpx_32rpx_rgba(0,0,0,0.06)]">
        <wd-qr-code v-if="hxNumber" :text="hxNumber" :size="200" />
        <view class="pointer-events-none absolute inset-0">
          <view class="absolute left-16rpx top-16rpx h-40rpx w-40rpx border-6 border-b-0 border-l-6 border-r-0 border-t-6 border-l-[#4FB89D] border-t-[#4FB89D] rounded-tl-8rpx border-solid" />
          <view class="absolute right-16rpx top-16rpx h-40rpx w-40rpx border-6 border-b-0 border-l-0 border-r-6 border-t-6 border-r-[#4FB89D] border-t-[#4FB89D] rounded-tr-8rpx border-solid" />
          <view class="absolute bottom-16rpx left-16rpx h-40rpx w-40rpx border-6 border-b-6 border-l-6 border-r-0 border-t-0 border-b-[#4FB89D] border-l-[#4FB89D] rounded-bl-8rpx border-solid" />
          <view class="absolute bottom-16rpx right-16rpx h-40rpx w-40rpx border-6 border-b-6 border-l-0 border-r-6 border-t-0 border-b-[#4FB89D] border-r-[#4FB89D] rounded-br-8rpx border-solid" />
        </view>
      </view>
      <view class="mt-24rpx text-26rpx text-[#A89080] tracking-2rpx">
        {{ t('orderDoing.deliveryQrcodeLabel') }}
      </view>
    </view>
  </view>
</template>
