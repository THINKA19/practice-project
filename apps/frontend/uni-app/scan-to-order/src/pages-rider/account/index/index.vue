<!--
============================================================================
【文件概述】个人中心页面视图；状态和操作由本模块组合函数提供。
【方法与导出清单】页面默认组件；useRiderAccountPage 负责页面装配。
【综合使用示例】
import { useRiderAccountPage } from './composables/use-page'
const page = useRiderAccountPage() // 在 script setup 中绑定页面数据
============================================================================
-->
<script setup lang="ts">
import PhoneContact from '@/components/phone-contact/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { onShow } from '@dcloudio/uni-app'
import { t } from '@/locale'
import { useRiderAccountPage } from './composables/use-page'

defineOptions({ name: 'RiderMine' })
definePage({
  style: {
    navigationBarTitleText: '我的',
    navigationBarBackgroundColor: '#A0826D',
    navigationBarTextStyle: 'white',
  },
})
// 装配骑手「我的」：资料 / 产出统计 / 设置项 / 退出登录
const { profile, stats, income, level, rating, completedCount, overviewError, refreshOverview, online, settingMenus, resolveStationPhone, goWorkbench, logout } = useRiderAccountPage()

onShow(() => uni.setNavigationBarTitle({ title: t('rider.workspace.account') }))
</script>

<template>
  <view class="mx-auto max-w-1120px min-h-100vh bg-[#FFF8F1] pb-60rpx">
    <!-- 资料卡 -->
    <view class="from-[#A0826D] to-[#8B7355] bg-gradient-to-br px-32rpx pb-60rpx pt-32rpx">
      <view class="flex items-center">
        <view class="mr-24rpx h-120rpx w-120rpx flex items-center justify-center rounded-full bg-white/20">
          <text class="text-44rpx text-white font-semibold">{{ profile?.name?.slice(0, 1) || 'R' }}</text>
        </view>
        <view class="min-w-0 flex-1">
          <view class="mb-10rpx flex items-center gap-16rpx">
            <text class="text-34rpx text-white font-bold">{{ profile?.name || t('rider.profile.notSignedIn') }}</text>
            <text class="rounded-16rpx bg-white/20 px-14rpx py-4rpx text-20rpx text-white">{{ level }}</text>
          </view>
          <view class="text-24rpx text-white/70">
            {{ profile?.phone || '' }}
          </view>
          <view class="mt-6rpx text-22rpx text-white/60">
            {{ online ? t('rider.workspace.online') : t('rider.workspace.offline') }} · {{ t('rider.profile.joinedAt', { date: profile?.joinedAt || '—' }) }}
          </view>
        </view>
      </view>
    </view>

    <!-- 产出统计 -->
    <view class="px-32rpx -mt-32rpx">
      <view class="grid grid-cols-3 rounded-24rpx bg-white p-32rpx shadow-[0_4rpx_16rpx_rgba(30,127,92,0.08)]">
        <view class="text-center">
          <text class="block text-36rpx text-[#5A3A22] font-bold">{{ stats.todayDone }}</text>
          <text class="mt-8rpx block text-22rpx text-[#A0826D]">{{ t('rider.profile.doneToday') }}</text>
        </view>
        <view class="text-center">
          <text class="block break-words text-36rpx text-[#A0826D] font-bold">
            <template v-for="(group, index) in income" :key="group.currency ?? ''">
              <text v-if="index > 0"> / </text>
              <FgPrice :amount="group.currency ? group.amount : undefined" :currency-code="group.currency" amount-unit="settlement" />
            </template>
          </text>
          <text class="mt-8rpx block text-22rpx text-[#A0826D]">{{ t('rider.profile.unsettled') }}</text>
        </view>
        <view class="text-center">
          <text class="block text-36rpx text-[#5A3A22] font-bold">{{ rating }}</text>
          <text class="mt-8rpx block text-22rpx text-[#A0826D]">{{ t('rider.profile.rating') }}</text>
        </view>
      </view>
    </view>

    <view class="mx-32rpx mt-24rpx text-24rpx text-[#8B7355]">
      {{ t('rider.profile.completed', { count: completedCount }) }}
      <view v-if="overviewError" @click="refreshOverview">
        {{ overviewError }} · {{ t('rider.workspace.retry') }}
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="mx-32rpx mt-32rpx">
      <view class="overflow-hidden rounded-24rpx bg-white shadow-[0_4rpx_16rpx_rgba(30,127,92,0.06)]">
        <PhoneContact :resolve-phone="resolveStationPhone">
          <template #trigger="{ open }">
            <wd-cell
              v-for="(m, i) in settingMenus" :key="m.name"
              :title="m.name"
              :label="m.description"
              is-link
              center
              :custom-style="i === settingMenus.length - 1 ? 'border-bottom: none;' : ''"
              @click="m.contact ? open() : m.action?.()"
            >
              <template #prefix>
                <view class="mr-24rpx h-68rpx w-68rpx flex items-center justify-center rounded-full" :style="{ background: `${m.color}22` }">
                  <view :class="m.icon" class="h-36rpx w-36rpx" :style="{ color: m.color }" />
                </view>
              </template>
            </wd-cell>
          </template>
        </PhoneContact>
      </view>
    </view>

    <!-- 返回工作台 / 退出登录 -->
    <view class="mx-32rpx mt-40rpx">
      <wd-button size="large" custom-class="!rounded-46rpx !h-92rpx" plain block @click="goWorkbench">
        {{ t('rider.profile.backWorkspace') }}
      </wd-button>
      <wd-button block size="large" custom-class="!mt-24rpx !rounded-46rpx !h-92rpx !bg-[#F44336] !text-white !border-none" @click="logout">
        {{ t('rider.login.signOut') }}
      </wd-button>
    </view>
  </view>
</template>
