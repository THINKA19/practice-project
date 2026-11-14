<script setup lang="ts">
import { RIDER_MINE_URL, RIDER_ORDER_LIST_URL } from '../routes'
import { RIDER_ORDER_STATUS } from '@/constants/status'
import { useRiderWorkbench } from '../composables'

definePage({
  style: {
    navigationBarTitleText: '骑手工作台',
    navigationBarBackgroundColor: '#1e7f5c',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true,
  },
})
defineOptions({ name: 'RiderWorkbench' })

// 装配骑手工作台：上下线 / 大厅抢单 / 在途订单流转 / 今日产出
const {
  profile,
  online,
  hallOrders,
  activeOrders,
  stats,
  level,
  target,
  progress,
  toggleOnline,
  refresh,
  onGrab,
  onPickup,
  onFinish,
  onCancel,
  callCustomer,
  maxConcurrent,
} = useRiderWorkbench()

const go = (url: string) => uni.navigateTo({ url })
</script>

<template>
  <view class="min-h-100vh bg-[#F4F6F5] pb-60rpx">
    <!-- 头部：骑手信息 + 上下线 -->
    <view class="bg-gradient-to-br from-[#1e7f5c] to-[#155a41] px-32rpx pb-60rpx pt-32rpx">
      <view class="mb-32rpx flex items-center justify-between">
        <view class="flex items-center">
          <view class="mr-20rpx flex h-88rpx w-88rpx items-center justify-center rounded-full bg-white/20">
            <text class="text-30rpx text-white font-semibold">{{ profile?.name?.slice(0, 1) || '骑' }}</text>
          </view>
          <view>
            <view class="text-30rpx text-white font-semibold">{{ profile?.name || '未登录' }}</view>
            <view class="mt-6rpx text-22rpx text-white/70">{{ level }} · 同时最多 {{ maxConcurrent }} 单</view>
          </view>
        </view>
        <view class="flex items-center gap-20rpx">
          <view class="flex h-64rpx w-64rpx items-center justify-center rounded-full bg-white/15" @click="go(RIDER_ORDER_LIST_URL)">
            <view class="i-carbon-document h-34rpx w-34rpx text-white" />
          </view>
          <view class="flex h-64rpx w-64rpx items-center justify-center rounded-full bg-white/15" @click="go(RIDER_MINE_URL)">
            <view class="i-carbon-user-avatar h-34rpx w-34rpx text-white" />
          </view>
        </view>
      </view>

      <!-- 上下线开关 -->
      <view class="mb-32rpx flex items-center justify-between rounded-24rpx bg-white/12 px-28rpx py-20rpx">
        <view>
          <view class="text-26rpx text-white">{{ online ? '接单中' : '已下线' }}</view>
          <view class="mt-6rpx text-22rpx text-white/60">{{ online ? '正在为你推送附近新单' : '上线后才能抢单' }}</view>
        </view>
        <view class="flex items-center rounded-full bg-white/25 px-28rpx py-12rpx" @click="toggleOnline">
          <view class="h-20rpx w-20rpx rounded-full" :class="online ? 'bg-[#7BE495]' : 'bg-white/60'" />
          <text class="ml-12rpx text-24rpx text-white">{{ online ? '点击下线' : '点击上线' }}</text>
        </view>
      </view>

      <!-- 今日产出 -->
      <view class="grid grid-cols-4 rounded-24rpx bg-white/10 p-24rpx">
        <view class="text-center">
          <text class="block text-32rpx text-white font-bold">{{ stats.todayDone }}</text>
          <text class="mt-8rpx block text-22rpx text-white/70">今日完成</text>
        </view>
        <view class="text-center">
          <text class="block text-32rpx text-[#ffd4a0] font-bold">¥{{ stats.todayIncome }}</text>
          <text class="mt-8rpx block text-22rpx text-white/70">今日收入</text>
        </view>
        <view class="text-center">
          <text class="block text-32rpx text-white font-bold">{{ stats.activeCount }}</text>
          <text class="mt-8rpx block text-22rpx text-white/70">进行中</text>
        </view>
        <view class="text-center">
          <text class="block text-32rpx text-white font-bold">{{ stats.rating }}</text>
          <text class="mt-8rpx block text-22rpx text-white/70">服务评分</text>
        </view>
      </view>

      <!-- 收入进度 -->
      <view class="mt-24rpx">
        <view class="mb-10rpx flex items-center justify-between text-22rpx text-white/70">
          <text>今日收入进度</text>
          <text>¥{{ stats.todayIncome }} / ¥{{ target }}</text>
        </view>
        <view class="h-12rpx overflow-hidden rounded-full bg-white/20">
          <view class="h-full rounded-full bg-[#ffd4a0]" :style="{ width: `${progress}%` }" />
        </view>
      </view>
    </view>

    <!-- 在途订单 -->
    <view class="-mt-32rpx px-32rpx">
      <view class="mb-20rpx flex items-center justify-between">
        <view class="flex items-center">
          <view class="mr-16rpx h-28rpx w-8rpx rounded-4rpx bg-[linear-gradient(180deg,#1e7f5c_0%,#2f9c74_100%)]" />
          <text class="text-30rpx text-[#2f3d36] font-semibold">进行中订单</text>
        </view>
        <text class="text-24rpx text-[#6b7c73]">{{ activeOrders.length }} 单</text>
      </view>

      <fg-empty v-if="!activeOrders.length" variant="tile" theme="rider" text="暂无进行中订单，去大厅抢单吧" />

      <view
        v-for="o in activeOrders"
        :key="o.id"
        class="mb-20rpx rounded-24rpx bg-white p-28rpx shadow-[0_4rpx_16rpx_rgba(30,127,92,0.06)]"
      >
        <view class="mb-16rpx flex items-center justify-between">
          <view class="flex items-center">
            <fg-status-tag :meta="RIDER_ORDER_STATUS[o.status]" :text="o.statusText" size="sm" class="mr-16rpx" />
            <text class="text-24rpx text-[#6b7c73]">{{ o.expectTime }}</text>
          </view>
          <text class="text-26rpx text-[#1e7f5c] font-semibold">+¥{{ o.deliveryFee }}</text>
        </view>

        <view class="mb-12rpx text-28rpx text-[#2f3d36] font-medium">{{ o.shopName }}</view>
        <view class="mb-8rpx text-24rpx text-[#5A6B63]">送达：{{ o.address }}</view>
        <view class="mb-20rpx text-22rpx text-[#8A9A93]">{{ o.customer }} · {{ o.phone }} · 订单 ¥{{ o.amount }}</view>

        <view class="flex items-center justify-end gap-16rpx">
          <wd-button size="small" plain custom-class="!rounded-32rpx" @click="callCustomer(o)">
            联系顾客
          </wd-button>
          <wd-button v-if="o.status === 'accepted'" size="small" plain custom-class="!rounded-32rpx" @click="onCancel(o)">
            转单
          </wd-button>
          <wd-button
            v-if="o.status === 'accepted'"
            size="small"
            custom-class="!rounded-32rpx !bg-[#2196F3] !text-white"
            @click="onPickup(o)"
          >
            已取餐
          </wd-button>
          <wd-button
            v-else
            size="small"
            custom-class="!rounded-32rpx !bg-[#2f9c74] !text-white"
            @click="onFinish(o)"
          >
            确认送达
          </wd-button>
        </view>
      </view>
    </view>

    <!-- 接单大厅 -->
    <view class="mt-32rpx px-32rpx">
      <view class="mb-20rpx flex items-center justify-between">
        <view class="flex items-center">
          <view class="mr-16rpx h-28rpx w-8rpx rounded-4rpx bg-[linear-gradient(180deg,#1e7f5c_0%,#2f9c74_100%)]" />
          <text class="text-30rpx text-[#2f3d36] font-semibold">接单大厅</text>
        </view>
        <text class="text-24rpx text-[#1e7f5c]" @click="refresh">刷新</text>
      </view>

      <fg-empty v-if="!hallOrders.length" variant="tile" theme="rider" text="暂无可抢订单" />

      <view
        v-for="o in hallOrders"
        :key="o.id"
        class="mb-20rpx rounded-24rpx bg-white p-28rpx shadow-[0_4rpx_16rpx_rgba(30,127,92,0.06)]"
      >
        <view class="mb-16rpx flex items-center justify-between">
          <text class="text-26rpx text-[#2f3d36] font-medium">{{ o.shopName }}</text>
          <text class="text-24rpx text-[#FF9800]">{{ o.distance }}</text>
        </view>
        <view class="mb-8rpx text-24rpx text-[#5A6B63]">送达：{{ o.address }}</view>
        <view class="mb-8rpx text-22rpx text-[#8A9A93]">{{ o.goodsSummary }}</view>
        <view class="mb-20rpx text-22rpx text-[#8A9A93]">下单 {{ o.createdAt }} · {{ o.expectTime }}</view>

        <view class="flex items-center justify-between">
          <text class="text-26rpx text-[#1e7f5c] font-bold">配送费 ¥{{ o.deliveryFee }}</text>
          <wd-button size="small" custom-class="!rounded-32rpx !bg-[#1e7f5c] !text-white" @click="onGrab(o)">
            立即抢单
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>
