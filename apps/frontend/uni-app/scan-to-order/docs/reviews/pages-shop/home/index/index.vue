<route lang="json5">
{ layout: 'default', style: { navigationStyle: 'custom', disableScroll: true } }
</route>

<script lang="ts" setup>
import { useAdminAuth, useDashboard, useMenus } from './composables'

// 登录态守卫由 useDashboard 内部的 onShow 负责（拿到结果后才拉数据）
const { shopInfo, pendingCount, statusDotClass } = useDashboard()
const { menus, navigateMenu } = useMenus(pendingCount)
const { handleLogout, goBackClient } = useAdminAuth()
</script>

<template>
  <view class="min-h-screen bg-[#f4f6f5]">
    <!-- 自定义导航栏 -->
    <view class="relative bg-gradient-to-br from-[#1e7f5c] to-[#155a41] px-4 pb-6 pt-[calc(var(--status-bar-height)+16rpx)] text-white">
      <view class="flex items-center justify-between gap-3">
        <!-- 返回顾客端：放左上角符合小程序返回习惯，圆形底让点击热区够大 -->
        <view
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10"
          hover-class="opacity-60"
          @tap="goBackClient"
        >
          <view class="i-carbon-arrow-left text-xl" />
        </view>

        <!-- 店铺信息 -->
        <view class="min-w-0 flex-1">
          <text class="block truncate text-base font-bold">{{ shopInfo.shopName }}</text>
          <view class="mt-0.5 flex items-center gap-1.5">
            <view class="h-2.5 w-2.5 shrink-0 rounded-full" :class="statusDotClass" />
            <text class="truncate text-xs text-white/70">{{ shopInfo.statusText }}</text>
          </view>
        </view>

        <!-- 退出登录 -->
        <view
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10"
          hover-class="opacity-60"
          @tap="handleLogout"
        >
          <view class="i-carbon-logout text-xl" />
        </view>
      </view>

      <!-- 今日数据 -->
      <view class="mt-4 grid grid-cols-3 rounded-2xl bg-white/10 p-3">
        <view class="text-center">
          <text class="block text-xl font-bold">{{ shopInfo.today.orders }}</text>
          <text class="mt-1 block text-xs text-white/70">今日订单</text>
        </view>
        <view class="text-center">
          <text class="block text-xl font-bold">¥{{ shopInfo.today.revenue }}</text>
          <text class="mt-1 block text-xs text-white/70">今日流水</text>
        </view>
        <view class="text-center">
          <text class="block text-xl font-bold text-[#ffd4a0]">{{ pendingCount }}</text>
          <text class="mt-1 block text-xs text-white/70">待处理</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="-mt-3 rounded-t-3xl bg-[#f4f6f5] px-4 pt-5">
      <text class="mb-3 block text-sm text-[#6b7c73] font-medium">功能管理</text>
      <view class="grid grid-cols-3 gap-4">
        <view
          v-for="item in menus"
          :key="item.path"
          class="relative flex flex-col items-center gap-2 rounded-2xl bg-white py-5 shadow-sm"
          @tap="navigateMenu(item)"
        >
          <view v-if="item.badge" class="absolute top-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4735c] px-1.5 text-xs text-white">
            {{ item.badge }}
          </view>
          <view class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br" :class="item.gradient">
            <view class="text-2xl text-white" :class="item.icon" />
          </view>
          <text class="text-sm text-[#2f3d36]">{{ item.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
