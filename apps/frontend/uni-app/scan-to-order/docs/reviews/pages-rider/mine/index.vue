<script setup lang="ts">
import { useRiderMine } from '../composables'

definePage({
  style: {
    navigationBarTitleText: '我的',
    navigationBarBackgroundColor: '#1e7f5c',
    navigationBarTextStyle: 'white',
  },
})
defineOptions({ name: 'RiderMine' })

// 装配骑手「我的」：资料 / 产出统计 / 设置项 / 退出登录
const { profile, stats, level, online, settingMenus, goWorkbench, logout } = useRiderMine()
</script>

<template>
  <view class="min-h-100vh bg-[#F4F6F5] pb-60rpx">
    <!-- 资料卡 -->
    <view class="bg-gradient-to-br from-[#1e7f5c] to-[#155a41] px-32rpx pb-60rpx pt-32rpx">
      <view class="flex items-center">
        <view class="mr-24rpx flex h-120rpx w-120rpx items-center justify-center rounded-full bg-white/20">
          <text class="text-44rpx text-white font-semibold">{{ profile?.name?.slice(0, 1) || '骑' }}</text>
        </view>
        <view class="min-w-0 flex-1">
          <view class="mb-10rpx flex items-center gap-16rpx">
            <text class="text-34rpx text-white font-bold">{{ profile?.name || '未登录' }}</text>
            <text class="rounded-16rpx bg-white/20 px-14rpx py-4rpx text-20rpx text-white">{{ level }}</text>
          </view>
          <view class="text-24rpx text-white/70">{{ profile?.phone || '' }}</view>
          <view class="mt-6rpx text-22rpx text-white/60">
            {{ online ? '接单中' : '已下线' }} · 加入 {{ profile?.joinedAt || '—' }}
          </view>
        </view>
      </view>
    </view>

    <!-- 产出统计 -->
    <view class="-mt-32rpx px-32rpx">
      <view class="grid grid-cols-3 rounded-24rpx bg-white p-32rpx shadow-[0_4rpx_16rpx_rgba(30,127,92,0.08)]">
        <view class="text-center">
          <text class="block text-36rpx text-[#2f3d36] font-bold">{{ stats.todayDone }}</text>
          <text class="mt-8rpx block text-22rpx text-[#8A9A93]">今日完成</text>
        </view>
        <view class="text-center">
          <text class="block text-36rpx text-[#1e7f5c] font-bold">¥{{ stats.todayIncome }}</text>
          <text class="mt-8rpx block text-22rpx text-[#8A9A93]">今日收入</text>
        </view>
        <view class="text-center">
          <text class="block text-36rpx text-[#2f3d36] font-bold">{{ stats.rating }}</text>
          <text class="mt-8rpx block text-22rpx text-[#8A9A93]">服务评分</text>
        </view>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="mx-32rpx mt-32rpx">
      <view class="overflow-hidden rounded-24rpx bg-white shadow-[0_4rpx_16rpx_rgba(30,127,92,0.06)]">
        <wd-cell
          v-for="(m, i) in settingMenus" :key="m.name"
          :title="m.name"
          is-link
          center
          :custom-style="i === settingMenus.length - 1 ? 'border-bottom: none;' : ''"
          @click="m.action()"
        >
          <template #prefix>
            <view class="mr-24rpx flex h-68rpx w-68rpx items-center justify-center rounded-full" :style="{ background: `${m.color}22` }">
              <view :class="m.icon" class="h-36rpx w-36rpx" :style="{ color: m.color }" />
            </view>
          </template>
        </wd-cell>
      </view>
    </view>

    <!-- 返回工作台 / 退出登录 -->
    <view class="mx-32rpx mt-40rpx">
      <wd-button block size="large" custom-class="!rounded-46rpx !h-92rpx" plain @click="goWorkbench">
        返回工作台
      </wd-button>
      <wd-button block size="large" custom-class="!mt-24rpx !rounded-46rpx !h-92rpx !bg-[#F44336] !text-white !border-none" @click="logout">
        退出登录
      </wd-button>
    </view>
  </view>
</template>
