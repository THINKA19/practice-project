<script lang="ts" setup>
import { PERIODS, useStatistics } from './composables'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '数据统计',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

const {
  activePeriod,
  overview,
  trend,
  topGoods,
  hourDist,
  payMix,
  barHeight,
  hourHeight,
  payColor,
  refresh,
  exportReport,
} = useStatistics()
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-80rpx">
    <!-- 时间筛选栏 -->
    <view class="sticky top-0 z-10 bg-white shadow-sm">
      <view class="flex items-center justify-between px-32rpx py-20rpx">
        <view class="flex gap-12rpx" @click.stop>
          <view
            v-for="(p, i) in PERIODS"
            :key="i"
            class="rounded-full px-24rpx py-10rpx text-26rpx transition-all"
            :class="activePeriod === i
              ? 'bg-[linear-gradient(135deg,#FF9F7F,#E68873)] text-white shadow'
              : 'bg-[#FFF5F0] text-[#8B5A3C]'"
            @click="activePeriod = i"
          >
            {{ p }}
          </view>
        </view>
        <view class="flex gap-12rpx">
          <view class="i-carbon-renew h-40rpx w-40rpx text-[#E68873]" @click="refresh" />
          <view class="i-carbon-download h-40rpx w-40rpx text-[#E68873]" @click="exportReport" />
        </view>
      </view>
    </view>

    <!-- 核心指标 2x3 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx flex items-center justify-between">
        <view class="text-28rpx text-[#5A3A22] font-semibold">
          核心指标
        </view>
        <view class="text-22rpx text-[#A0826D]">
          数据每15分钟自动更新
        </view>
      </view>
      <view class="grid grid-cols-3 gap-20rpx">
        <view class="rounded-24rpx bg-[#FFF5F0] p-24rpx text-center">
          <view class="text-22rpx text-[#A0826D]">
            营业额
          </view>
          <view class="mt-12rpx text-40rpx text-[#E68873] font-bold">
            ¥{{ overview.revenue }}
          </view>
        </view>
        <view class="rounded-24rpx bg-[#E8F5E9] p-24rpx text-center">
          <view class="text-22rpx text-[#A0826D]">
            订单数
          </view>
          <view class="mt-12rpx text-40rpx text-[#4CAF50] font-bold">
            {{ overview.orderCount }}
          </view>
        </view>
        <view class="rounded-24rpx bg-[#E3F2FD] p-24rpx text-center">
          <view class="text-22rpx text-[#A0826D]">
            就餐人数
          </view>
          <view class="mt-12rpx text-40rpx text-[#2196F3] font-bold">
            {{ overview.customerCount }}
          </view>
        </view>
        <view class="rounded-24rpx bg-[#F3E5F5] p-24rpx text-center">
          <view class="text-22rpx text-[#A0826D]">
            客单价
          </view>
          <view class="mt-12rpx text-40rpx text-[#9C27B0] font-bold">
            ¥{{ overview.avgCustomerPrice }}
          </view>
        </view>
        <view class="rounded-24rpx bg-[#FFEBEE] p-24rpx text-center">
          <view class="text-22rpx text-[#A0826D]">
            退款额
          </view>
          <view class="mt-12rpx text-40rpx text-[#F44336] font-bold">
            ¥{{ overview.refund }}
          </view>
        </view>
        <view class="rounded-24rpx bg-[#FFF8E1] p-24rpx text-center">
          <view class="text-22rpx text-[#A0826D]">
            新增会员
          </view>
          <view class="mt-12rpx text-40rpx text-[#FF9800] font-bold">
            {{ overview.newMembers }}
          </view>
        </view>
      </view>
    </view>

    <!-- 营业额趋势 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-32rpx flex items-center justify-between">
        <view class="text-28rpx text-[#5A3A22] font-semibold">
          营业额趋势（近7日）
        </view>
        <view class="rounded-full bg-[#FFF5F0] px-20rpx py-6rpx text-22rpx text-[#E68873]">
          单位：元
        </view>
      </view>
      <view class="h-300rpx flex items-end gap-16rpx">
        <view
          v-for="t in trend"
          :key="t.day"
          class="flex flex-1 flex-col items-center"
        >
          <view class="mb-8rpx text-20rpx text-[#A0826D]">
            {{ t.value }}
          </view>
          <view
            class="w-full rounded-t-12rpx bg-[linear-gradient(180deg,#FF9F7F,#E68873)] shadow-inner"
            :style="{ height: barHeight(t.value) }"
          />
          <view class="mt-12rpx text-22rpx text-[#5A4A42]">
            {{ t.day }}
          </view>
        </view>
      </view>
    </view>

    <!-- 两列并行：热销TOP5 + 订单时段分布 -->
    <view class="grid grid-cols-1 mx-24rpx mt-24rpx gap-24rpx md:grid-cols-2">
      <!-- 热销TOP5 -->
      <view class="rounded-32rpx bg-white p-32rpx shadow-sm">
        <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
          商品销量 TOP 5
        </view>
        <view class="space-y-24rpx">
          <view v-for="g in topGoods" :key="g.rank" class="flex items-center gap-20rpx">
            <view
              class="h-56rpx w-56rpx flex shrink-0 items-center justify-center rounded-16rpx text-26rpx text-white font-bold"
              :class="{
                'bg-[#FF9800]': g.rank === 1,
                'bg-[#BDBDBD]': g.rank === 2,
                'bg-[#CD7F32]': g.rank === 3,
                'bg-[#E0CFBC]': g.rank > 3,
              }"
            >
              {{ g.rank }}
            </view>
            <view class="min-w-0 flex-1">
              <view class="mb-8rpx flex items-center justify-between">
                <text class="truncate text-26rpx text-[#5A3A22] font-medium">{{ g.name }}</text>
                <text class="text-24rpx text-[#E68873]">¥{{ g.amount }}</text>
              </view>
              <view class="flex items-center gap-16rpx">
                <view class="h-16rpx flex-1 overflow-hidden rounded-full bg-[#F5EDE3]">
                  <view
                    class="h-full rounded-full bg-[linear-gradient(90deg,#FF9F7F,#E68873)]"
                    :style="{ width: `${g.pct}%` }"
                  />
                </view>
                <view class="whitespace-nowrap text-22rpx text-[#A0826D]">
                  {{ g.sold }}份
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单时段分布 -->
      <view class="rounded-32rpx bg-white p-32rpx shadow-sm">
        <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
          订单时段分布
        </view>
        <view class="h-280rpx flex items-end gap-12rpx pb-40rpx">
          <view
            v-for="h in hourDist"
            :key="h.h"
            class="relative flex flex-1 flex-col items-center"
          >
            <view class="mb-6rpx text-20rpx text-[#A0826D]">
              {{ h.v }}
            </view>
            <view
              class="w-full rounded-t-8rpx bg-[linear-gradient(180deg,#81D4FA,#29B6F6)]"
              :style="{ height: hourHeight(h.v) }"
            />
          </view>
        </view>
        <view class="flex gap-12rpx">
          <view v-for="h in hourDist" :key="h.h" class="flex-1 text-center text-20rpx text-[#5A4A42]">
            {{ h.h }}
          </view>
        </view>
      </view>
    </view>

    <!-- 支付方式占比 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
        支付方式占比
      </view>
      <view class="grid grid-cols-2 gap-20rpx md:grid-cols-4">
        <view
          v-for="(p, i) in payMix"
          :key="p.name"
          class="border-l-8 rounded-24rpx p-24rpx"
          :style="{ borderColor: payColor(i), background: `${payColor(i)}10` }"
        >
          <view class="text-22rpx text-[#5A4A42]">
            {{ p.name }}
          </view>
          <view class="mt-12rpx flex items-baseline">
            <view class="text-40rpx font-bold" :style="{ color: payColor(i) }">
              {{ p.value }}%
            </view>
          </view>
          <view class="mt-8rpx text-22rpx text-[#A0826D]">
            ¥{{ p.amount }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
