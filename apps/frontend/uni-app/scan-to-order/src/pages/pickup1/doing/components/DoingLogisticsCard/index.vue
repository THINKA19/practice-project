<script lang="ts" setup>
/**
 * 配送信息卡：收货人 + 地址（只有配送单才渲染，自提单由页面 v-if 挡掉）
 */
import type { LogisticsItem } from '@/pages/pickup/shared'
import { t } from '@/locale'

defineProps<{
  /** 收货信息 */
  logistics: LogisticsItem
}>()
</script>

<template>
  <view class="mb-32rpx rounded-24rpx bg-white p-40rpx shadow-[0_4rpx_24rpx_rgba(139,111,71,0.06)]">
    <view class="mb-32rpx flex items-center border-0 border-b-2 border-b-[#F5F0EA] border-solid pb-20rpx text-32rpx text-[#5D4E3C] font-semibold">
      <view class="i-carbon-location mr-12rpx text-40rpx text-[#FF9F5A]" />
      <text>{{ t('orderDoing.logisticsInfo') }}</text>
    </view>
    <view class="rounded-16rpx bg-[linear-gradient(135deg,#FFF9F0_0%,#FFEDE0_100%)] p-24rpx">
      <view class="mb-16rpx flex items-center">
        <text class="mr-24rpx text-32rpx text-[#5D4E3C] font-semibold">{{ logistics.linkMan }}</text>
        <text class="text-28rpx text-[#8B6F47]">{{ logistics.mobile }}</text>
      </view>
      <view class="text-28rpx text-[#A89080] leading-44rpx">
        {{ logistics.provinceStr }}{{ logistics.cityStr }}{{ logistics.areaStr }}{{ logistics.address }}
      </view>
    </view>
  </view>
</template>
