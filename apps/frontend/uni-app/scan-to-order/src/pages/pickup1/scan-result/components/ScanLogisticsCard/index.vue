<script lang="ts" setup>
/**
 * 配送信息卡（自提单没有这一块，由页面 v-if 挡掉）
 */
import type { LogisticsItem } from '@/pages/pickup1/scan'
import { t } from '@/locale'

defineProps<{
  /** 收货信息 */
  logistics: LogisticsItem
}>()
</script>

<template>
  <view class="mx-24rpx mb-24rpx animate-[fadeInUp_0.5s_ease-out] overflow-hidden rounded-24rpx bg-white shadow-[0_8rpx_24rpx_rgba(139,90,60,0.12)]">
    <view class="flex items-center border-0 border-b-2 border-b-[#F5F5F5] border-solid px-28rpx pb-24rpx pt-32rpx">
      <view class="mr-16rpx h-48rpx w-48rpx center rounded-12rpx bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE8CC_100%)] text-36rpx">
        <view class="i-carbon-location text-[#A0673E]" />
      </view>
      <view class="text-30rpx text-[#5D3A1A] font-semibold tracking-1rpx">
        {{ t('orderScan.logisticsInfo') }}
      </view>
    </view>
    <view class="p-24rpx px-28rpx pb-32rpx">
      <view class="border-l-4 border-l-[#A0673E] border-solid pl-20rpx">
        <view class="mb-16rpx flex items-center">
          <view class="mr-24rpx text-30rpx text-[#2C2C2C] font-semibold">
            {{ logistics.linkMan }}
          </view>
          <view class="rounded-8rpx bg-[#F8F8F8] px-16rpx py-4rpx text-28rpx text-[#666666]">
            {{ logistics.mobile }}
          </view>
        </view>
        <view class="text-26rpx text-[#666666] leading-40rpx">
          {{ logistics.provinceStr }} {{ logistics.cityStr }} {{ logistics.areaStr }} {{ logistics.address }}
        </view>
      </view>
    </view>
  </view>
</template>
