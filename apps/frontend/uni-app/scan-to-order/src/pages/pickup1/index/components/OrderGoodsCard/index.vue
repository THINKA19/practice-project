<script lang="ts" setup>
/**
 * 订单商品卡：商品行 + 合计
 *
 * 只负责「一张商品卡长什么样」，商品数据与合计金额都由页面传入。
 */
import type { GoodsItem } from '../../models/types'
import { t } from '@/locale'

defineProps<{
  /** 商品行 */
  goods: GoodsItem[]
  /** 订单实付金额（合计） */
  amountReal?: number
}>()
</script>

<template>
  <view class="mb-24rpx rounded-20rpx bg-white p-32rpx shadow-[0_4rpx_16rpx_rgba(139,69,19,0.08)]">
    <view class="mb-24rpx flex items-center border-0 border-b-2 border-b-[#F5E6D3] border-solid pb-20rpx">
      <view class="i-carbon-cafe mr-12rpx text-36rpx text-[#8B4513]" />
      <view class="text-32rpx text-[#8B4513] font-bold">
        {{ t('orderDetail.goodsTitle') }}
      </view>
    </view>

    <view class="mb-24rpx">
      <view
        v-for="item in goods"
        :key="item.id"
        class="flex items-start justify-between border-0 border-b-1 border-b-[#F5F5F5] border-solid py-24rpx last:border-b-0"
      >
        <view class="flex-1 pr-24rpx">
          <view class="mb-8rpx text-30rpx text-[#333333] font-medium">
            {{ item.goodsName }}
          </view>
          <view v-if="item.property" class="mt-8rpx inline-block rounded-6rpx bg-[#F5F5F5] px-12rpx py-4rpx text-24rpx text-[#999999] leading-36rpx">
            {{ item.property }}
          </view>
        </view>
        <view class="flex flex-col items-end">
          <view class="mb-8rpx text-32rpx text-[#8B4513] font-bold">
            ¥{{ item.amount }}
          </view>
          <view class="text-26rpx text-[#999999]">
            x{{ item.number }}
          </view>
        </view>
      </view>
    </view>

    <view class="my-24rpx h-2rpx bg-[linear-gradient(to_right,#F5E6D3,#D2B48C,#F5E6D3)]" />

    <view class="flex items-center justify-between pt-24rpx">
      <view class="text-30rpx text-[#666666]">
        {{ t('orderDetail.total') }}
      </view>
      <view class="text-40rpx text-[#8B4513] font-bold font-mono">
        ¥{{ amountReal }}
      </view>
    </view>
  </view>
</template>
