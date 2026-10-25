<script lang="ts" setup>
/**
 * 优惠信息卡：这一单用掉的券（type=0 文案券 / type=1 图片券）
 */
import type { GoodsCouponItem } from '../models/order'
import { t } from '@/locale'

defineProps<{
  /** 用掉的券 */
  coupons: GoodsCouponItem[]
}>()
</script>

<template>
  <view class="mx-24rpx mb-24rpx animate-[fadeInUp_0.5s_ease-out] overflow-hidden rounded-24rpx bg-[linear-gradient(135deg,#FFF8F0_0%,#FFFFFF_100%)] shadow-[0_8rpx_24rpx_rgba(139,90,60,0.12)]">
    <view class="flex items-center border-0 border-b-2 border-b-[#F5F5F5] border-solid px-28rpx pb-24rpx pt-32rpx">
      <view class="mr-16rpx h-48rpx w-48rpx center rounded-12rpx bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE8CC_100%)] text-36rpx">
        <view class="i-carbon-gift text-[#A0673E]" />
      </view>
      <view class="text-30rpx text-[#5D3A1A] font-semibold tracking-1rpx">
        {{ t('orderScan.couponInfo') }}
      </view>
    </view>
    <view class="px-28rpx pb-24rpx">
      <template v-for="item in coupons" :key="item.id">
        <!-- 文案券 -->
        <view v-if="item.type === 0" class="mb-16rpx flex items-center justify-between rounded-12rpx bg-[linear-gradient(90deg,#A0673E_0%,#8B5A3C_100%)] px-24rpx py-20rpx last:mb-0">
          <view class="text-26rpx text-white font-semibold">
            {{ t('coupons.title') }}
          </view>
          <view class="text-28rpx text-[#FFE8CC] font-bold">
            {{ item.coupon }}
          </view>
        </view>
        <!-- 图片券 -->
        <image v-if="item.type === 1" :src="item.coupon" mode="widthFix" class="mb-16rpx w-full rounded-12rpx" />
      </template>
    </view>
  </view>
</template>
