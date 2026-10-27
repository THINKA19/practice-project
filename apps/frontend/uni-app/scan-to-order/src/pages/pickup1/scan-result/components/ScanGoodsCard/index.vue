<script lang="ts" setup>
/**
 * 商品信息卡：带图的商品行列表
 */
import type { GoodsItem } from '@/pages/pickup1/scan'
import { t } from '@/locale'

defineProps<{
  /** 商品行 */
  goods: GoodsItem[]
}>()
</script>

<template>
  <view class="mx-24rpx mb-24rpx animate-[fadeInUp_0.5s_ease-out] overflow-hidden rounded-24rpx bg-white pb-16rpx shadow-[0_8rpx_24rpx_rgba(139,90,60,0.12)]">
    <view class="flex items-center border-0 border-b-2 border-b-[#F5F5F5] border-solid px-28rpx pb-24rpx pt-32rpx">
      <view class="mr-16rpx h-48rpx w-48rpx center rounded-12rpx bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE8CC_100%)] text-36rpx">
        <view class="i-carbon-cafe text-[#A0673E]" />
      </view>
      <view class="text-30rpx text-[#5D3A1A] font-semibold tracking-1rpx">
        {{ t('orderScan.goodsInfo') }}
      </view>
    </view>
    <view>
      <view
        v-for="item in goods"
        :key="item.id"
        class="flex border-0 border-b-1 border-b-transparent border-solid p-24rpx px-28rpx"
      >
        <view class="mr-20rpx h-180rpx w-180rpx shrink-0 overflow-hidden rounded-16rpx bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE8CC_100%)] shadow-[0_4rpx_12rpx_rgba(0,0,0,0.08)]">
          <image :src="item.pic" class="h-full w-full" mode="aspectFill" />
        </view>
        <view class="flex flex-1 flex-col justify-between py-8rpx">
          <view class="line-clamp-2 mb-8rpx text-28rpx text-[#2C2C2C] font-semibold leading-40rpx">
            {{ item.goodsName }}
          </view>
          <view v-if="item.property" class="mb-12rpx self-start rounded-6rpx bg-[#F5F5F5] px-12rpx py-6rpx text-24rpx text-[#999999]">
            {{ item.property }}
          </view>
          <view class="flex items-end justify-between">
            <view class="flex items-baseline">
              <text class="mr-4rpx text-24rpx text-[#A0673E] font-semibold">¥</text>
              <text class="text-32rpx text-[#A0673E] font-bold">{{ item.amount }}</text>
            </view>
            <view class="rounded-8rpx bg-[#F8F8F8] px-16rpx py-6rpx text-26rpx text-[#999999]">
              x {{ item.number }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
