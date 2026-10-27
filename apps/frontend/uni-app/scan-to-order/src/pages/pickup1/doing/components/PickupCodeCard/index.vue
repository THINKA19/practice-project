<script lang="ts" setup>
/**
 * 取单号卡（自提单）：取单号 + 核销二维码
 *
 * 为什么核销码画布收在本组件：swiper 每一屏各有一张卡，画布必须由**卡自己**持有并绘制
 * （`uni.createCanvasContext` 的 canvas-id 只在本实例作用域内有效）。
 * 原实现靠页面的 `@change` 事件补画，第 2 屏起要手动滑到才显示 ——
 * 现在每屏挂载时就把自己的码画好了。
 */
import { t } from '@/locale'

defineProps<{
  /** 取单号 */
  qudanhao: string
  /** 核销码内容 */
  hxNumber: string
}>()
</script>

<template>
  <view class="relative mb-32rpx overflow-hidden rounded-32rpx bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFBF5_100%)] p-48rpx shadow-[0_8rpx_32rpx_rgba(139,111,71,0.08)]">
    <view class="absolute left-0 right-0 top-0 h-8rpx bg-[linear-gradient(90deg,#FF9F5A_0%,#6DD0A5_100%)]" />

    <view class="mb-40rpx flex items-center">
      <view class="i-carbon-list mr-16rpx text-48rpx text-[#FF9F5A]" />
      <view class="text-36rpx text-[#8B6F47] font-semibold">
        {{ t('orderDoing.qudanhao') }}
      </view>
    </view>

    <view class="relative mb-48rpx rounded-24rpx bg-[linear-gradient(135deg,#FFF9F0_0%,#FFEDE0_100%)] p-40rpx py-0 text-center">
      <view class="pb-40rpx pt-40rpx text-96rpx text-[#FF7B3E] font-bold tracking-8rpx">
        {{ qudanhao }}
      </view>
      <view class="pb-40rpx text-26rpx text-[#A89080] tracking-2rpx">
        {{ t('orderDoing.pickTips') }}
      </view>
    </view>

    <view class="mt-40rpx flex flex-col items-center">
      <view class="relative rounded-24rpx bg-white p-32rpx shadow-[0_8rpx_32rpx_rgba(0,0,0,0.06)]">
        <wd-qr-code v-if="hxNumber" :text="hxNumber" :size="200" />
        <view class="pointer-events-none absolute inset-0">
          <view class="absolute left-16rpx top-16rpx h-40rpx w-40rpx border-6 border-b-0 border-l-6 border-r-0 border-t-6 border-l-[#FF9F5A] border-t-[#FF9F5A] rounded-tl-8rpx border-solid" />
          <view class="absolute right-16rpx top-16rpx h-40rpx w-40rpx border-6 border-b-0 border-l-0 border-r-6 border-t-6 border-r-[#FF9F5A] border-t-[#FF9F5A] rounded-tr-8rpx border-solid" />
          <view class="absolute bottom-16rpx left-16rpx h-40rpx w-40rpx border-6 border-b-6 border-l-6 border-r-0 border-t-0 border-b-[#FF9F5A] border-l-[#FF9F5A] rounded-bl-8rpx border-solid" />
          <view class="absolute bottom-16rpx right-16rpx h-40rpx w-40rpx border-6 border-b-6 border-l-0 border-r-6 border-t-0 border-b-[#FF9F5A] border-r-[#FF9F5A] rounded-br-8rpx border-solid" />
        </view>
      </view>
      <view class="mt-24rpx text-26rpx text-[#A89080] tracking-2rpx">
        {{ t('orderDoing.qrcodeLabel') }}
      </view>
    </view>
  </view>
</template>
