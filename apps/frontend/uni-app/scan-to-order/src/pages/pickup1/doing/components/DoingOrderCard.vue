<script lang="ts" setup>
/**
 * 订单明细卡：商品行 + 合计 + 下单时间
 */
import type { GoodsItem } from '@/pages/pickup/index'
import { t } from '@/locale'

defineProps<{
  /** 商品行 */
  goods: GoodsItem[]
  /** 订单实付金额（合计） */
  amountReal: number
  /** 下单时间 */
  dateAdd: string
}>()
</script>

<template>
  <view class="mb-32rpx rounded-24rpx bg-white p-40rpx shadow-[0_4rpx_24rpx_rgba(139,111,71,0.06)]">
    <view class="mb-32rpx flex items-center border-0 border-b-2 border-b-[#F5F0EA] border-solid pb-20rpx text-32rpx text-[#5D4E3C] font-semibold">
      <view class="i-carbon-document mr-12rpx text-40rpx text-[#FF9F5A]" />
      <text>{{ t('orderDoing.orderDetail') }}</text>
    </view>

    <view class="mb-24rpx">
      <view
        v-for="goodsItem in goods"
        :key="goodsItem.id"
        class="flex items-start justify-between border-0 border-b-1 border-b-[#F5F0EA] border-solid py-24rpx last:border-b-0"
      >
        <view class="mr-24rpx flex-1">
          <view class="mb-8rpx text-30rpx text-[#5D4E3C] font-medium leading-42rpx">
            {{ goodsItem.goodsName }}
          </view>
          <view v-if="goodsItem.property" class="mt-4rpx text-24rpx text-[#A89080] leading-36rpx">
            {{ goodsItem.property }}
          </view>
        </view>
        <view class="flex items-center gap-24rpx">
          <view class="min-w-60rpx text-right text-28rpx text-[#8B6F47]">
            x{{ goodsItem.number }}
          </view>
          <view class="min-w-100rpx text-right text-32rpx text-[#FF7B3E] font-semibold">
            ¥{{ goodsItem.amount }}
          </view>
        </view>
      </view>
    </view>

    <view class="my-24rpx h-2rpx bg-[linear-gradient(90deg,transparent_0%,#F5F0EA_50%,transparent_100%)]" />

    <view class="mb-24rpx flex items-center justify-between rounded-16rpx bg-[linear-gradient(135deg,#FFF9F0_0%,#FFEDE0_100%)] p-24rpx">
      <view class="text-32rpx text-[#5D4E3C] font-semibold">
        {{ t('orderDoing.total') }}
      </view>
      <view class="text-44rpx text-[#FF7B3E] font-bold font-mono">
        ¥{{ amountReal }}
      </view>
    </view>

    <view class="flex items-center justify-center p-16rpx text-24rpx text-[#A89080]">
      <view class="i-carbon-time mr-8rpx text-28rpx" />
      <text>{{ t('orderDoing.dateAdd') }}: {{ dateAdd }}</text>
    </view>
  </view>
</template>
