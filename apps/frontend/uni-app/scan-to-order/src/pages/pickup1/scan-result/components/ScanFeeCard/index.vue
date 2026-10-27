<script lang="ts" setup>
/**
 * 费用明细卡：商品金额 + 运费 = 实付金额
 */
import type { OrderInfo } from '@/pages/pickup1/scan'
import { t } from '@/locale'

defineProps<{
  /** 订单金额信息 */
  orderInfo: OrderInfo
}>()
</script>

<template>
  <view class="mx-24rpx mb-24rpx animate-[fadeInUp_0.5s_ease-out] overflow-hidden rounded-24rpx bg-[linear-gradient(135deg,#FFFBF5_0%,#FFFFFF_100%)] shadow-[0_8rpx_24rpx_rgba(139,90,60,0.12)]">
    <view class="flex items-center border-0 border-b-2 border-b-[#F5F5F5] border-solid px-28rpx pb-24rpx pt-32rpx">
      <view class="mr-16rpx h-48rpx w-48rpx center rounded-12rpx bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE8CC_100%)] text-36rpx">
        <view class="i-carbon-wallet text-[#A0673E]" />
      </view>
      <view class="text-30rpx text-[#5D3A1A] font-semibold tracking-1rpx">
        {{ t('orderScan.feeInfo') }}
      </view>
    </view>
    <view class="px-28rpx pb-24rpx pt-16rpx">
      <view class="flex items-center justify-between py-16rpx">
        <view class="text-28rpx text-[#666666]">
          {{ t('orderScan.goodsAmount') }}
        </view>
        <view class="text-28rpx text-[#2C2C2C] font-medium">
          ¥ {{ orderInfo.amount }}
        </view>
      </view>
      <view class="flex items-center justify-between py-16rpx">
        <view class="text-28rpx text-[#666666]">
          {{ t('orderScan.freight') }}
        </view>
        <view class="text-28rpx text-[#2C2C2C] font-medium">
          + ¥ {{ orderInfo.amountLogistics }}
        </view>
      </view>
      <view class="my-12rpx h-1rpx bg-[linear-gradient(90deg,transparent_0%,#DDDDDD_50%,transparent_100%)]" />
      <view class="flex items-center justify-between pb-8rpx pt-20rpx">
        <view class="text-30rpx text-[#2C2C2C] font-semibold">
          {{ t('orderScan.realAmount') }}
        </view>
        <view class="flex items-baseline">
          <text class="mr-4rpx text-28rpx text-[#A0673E] font-bold">¥</text>
          <text class="text-40rpx text-[#A0673E] font-extrabold font-mono">{{ orderInfo.amountReal }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
