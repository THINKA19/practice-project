<script setup lang="ts">
import type { DispatchOrder, Rider, RiderStatus } from './type'
import { computed, ref } from 'vue'
import { RIDER_MAX_LOAD } from './type'
import { useRiderDispatch, useRiderList } from './composables'
import { SHOP_DISPATCH_STATUS, SHOP_RIDER_STATUS, SHOP_RIDER_TABS } from '@/constants/status'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '骑手管理',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})
defineOptions({ name: 'ShopRiderList' })

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

// 装配商家端骑手模块：骑手列表 / 配送单派发
const { riders, activeTab, list, badge, stats, toggleStatus, callRider, addRider, removeRider, rejectReason } = useRiderList()
const { waitingOrders, dispatchedOrders, dispatch, withdraw, markDelivered } = useRiderDispatch(riders)

// 派单弹窗：当前待派送的订单
const dispatchVisible = ref(false)
const dispatchOrder = ref<DispatchOrder | null>(null)

/** 可选骑手：已下线或满负载的骑手置灰 */
const candidateRiders = computed(() =>
  riders.value.map(r => ({ rider: r, reason: rejectReason(r) })),
)

function openDispatch(order: DispatchOrder) {
  dispatchOrder.value = order
  dispatchVisible.value = true
}

function onPick(rider: Rider, reason: string | null) {
  if (reason) {
    uni.showToast({ title: reason, icon: 'none' })
    return
  }
  if (!dispatchOrder.value)
    return
  dispatch(dispatchOrder.value, rider)
  dispatchVisible.value = false
}

const statusMeta = (s: RiderStatus) => SHOP_RIDER_STATUS[s]
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-80rpx">
    <!-- 概览统计：4 格 -->
    <view class="mx-24rpx mt-24rpx grid grid-cols-4 gap-16rpx">
      <view class="flex flex-col items-center rounded-24rpx bg-white py-28rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]">
        <text class="text-36rpx text-[#333333] font-bold">{{ stats.online }}</text>
        <text class="mt-8rpx text-22rpx text-[#A0826D]">在线骑手</text>
      </view>
      <view class="flex flex-col items-center rounded-24rpx bg-white py-28rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]">
        <text class="text-36rpx text-[#FF9800] font-bold">{{ stats.busy }}</text>
        <text class="mt-8rpx text-22rpx text-[#A0826D]">配送中</text>
      </view>
      <view class="flex flex-col items-center rounded-24rpx bg-white py-28rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]">
        <text class="text-36rpx text-[#333333] font-bold">{{ stats.todayOrders }}</text>
        <text class="mt-8rpx text-22rpx text-[#A0826D]">今日完成</text>
      </view>
      <view class="flex flex-col items-center rounded-24rpx bg-white py-28rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]">
        <text class="text-36rpx text-[#E68873] font-bold">{{ stats.todayIncome }}</text>
        <text class="mt-8rpx text-22rpx text-[#A0826D]">今日配送收入</text>
      </view>
    </view>

    <!-- 待派送订单 -->
    <view class="mx-24rpx mt-32rpx">
      <view class="mb-20rpx flex items-center">
        <view class="mr-16rpx h-28rpx w-8rpx rounded-4rpx bg-[linear-gradient(180deg,#8B7355_0%,#A0826D_100%)]" />
        <text class="text-30rpx text-[#333333] font-semibold">待派送订单</text>
        <text class="ml-12rpx text-24rpx text-[#A0826D]">{{ waitingOrders.length }} 单</text>
      </view>

      <fg-empty v-if="!waitingOrders.length" variant="tile" text="暂无待派送订单" />

      <view
        v-for="o in waitingOrders"
        :key="o.id"
        class="mb-20rpx rounded-24rpx bg-white p-28rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]"
      >
        <view class="mb-16rpx flex items-center justify-between">
          <view class="flex items-center">
            <text class="mr-16rpx text-26rpx text-[#5A4A42] font-medium">{{ o.id }}</text>
            <text class="rounded-full bg-[#FFF5E4] px-16rpx py-4rpx text-22rpx text-[#8B5A3C]">{{ o.type }}</text>
          </view>
          <text class="text-24rpx text-[#E68873]">配送费 ¥{{ o.deliveryFee }}</text>
        </view>
        <view class="mb-8rpx text-26rpx text-[#5A3A22]">{{ o.address }}</view>
        <view class="mb-20rpx text-24rpx text-[#A0826D]">{{ o.customer }} · {{ o.phone }} · {{ o.expectTime }}</view>
        <view class="flex items-center justify-between">
          <text class="text-26rpx text-[#5A4A42]">订单金额 <text class="text-32rpx text-[#E68873] font-bold">¥{{ o.amount }}</text></text>
          <wd-button size="small" custom-class="!rounded-32rpx !bg-[#E68873] !text-white" @click="openDispatch(o)">
            派单
          </wd-button>
        </view>
      </view>
    </view>

    <!-- 骑手列表 -->
    <view class="mx-24rpx mt-32rpx">
      <view class="mb-20rpx flex items-center justify-between">
        <view class="flex items-center">
          <view class="mr-16rpx h-28rpx w-8rpx rounded-4rpx bg-[linear-gradient(180deg,#8B7355_0%,#A0826D_100%)]" />
          <text class="text-30rpx text-[#333333] font-semibold">骑手列表</text>
        </view>
        <wd-button size="small" custom-class="!rounded-32rpx" @click="addRider">
          新增骑手
        </wd-button>
      </view>

      <!-- 状态筛选 Tab -->
      <view class="mb-20rpx flex gap-16rpx">
        <view
          v-for="t in SHOP_RIDER_TABS"
          :key="t.key"
          class="rounded-full px-24rpx py-10rpx text-24rpx"
          :class="activeTab === t.key ? 'bg-[#E68873] text-white' : 'bg-white text-[#8B5A3C]'"
          @click="activeTab = t.key"
        >
          {{ t.label }} {{ badge(t.key) }}
        </view>
      </view>

      <fg-empty v-if="!list.length" variant="tile" text="暂无骑手" />

      <view
        v-for="r in list"
        :key="r.id"
        class="mb-20rpx flex items-center rounded-24rpx bg-white p-28rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]"
      >
        <!-- 头像 -->
        <view class="mr-20rpx flex h-84rpx w-84rpx shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#D4A574_0%,#C49563_100%)]">
          <text class="text-30rpx text-white font-semibold">{{ r.name.slice(0, 1) }}</text>
        </view>

        <!-- 信息 -->
        <view class="min-w-0 flex-1">
          <view class="mb-8rpx flex items-center gap-12rpx">
            <text class="text-28rpx text-[#333333] font-semibold">{{ r.name }}</text>
            <fg-status-tag :meta="statusMeta(r.status)" size="sm" @click="toggleStatus(r)" />
          </view>
          <view class="text-22rpx text-[#A0826D]">
            负载 {{ r.load }}/{{ RIDER_MAX_LOAD }} · 今日 {{ r.todayOrders }} 单 · ¥{{ r.todayIncome }}
          </view>
        </view>

        <!-- 操作 -->
        <view class="ml-16rpx flex shrink-0 gap-16rpx">
          <view class="flex h-60rpx w-60rpx items-center justify-center rounded-full bg-[rgba(33,150,243,0.1)]" @click="callRider(r)">
            <view class="i-carbon-phone h-30rpx w-30rpx text-[#2196F3]" />
          </view>
          <view class="flex h-60rpx w-60rpx items-center justify-center rounded-full bg-[rgba(244,67,54,0.1)]" @click="removeRider(r)">
            <view class="i-carbon-trash-can h-30rpx w-30rpx text-[#F44336]" />
          </view>
        </view>
      </view>
    </view>

    <!-- 已派单配送单 -->
    <view class="mx-24rpx mt-32rpx">
      <view class="mb-20rpx flex items-center">
        <view class="mr-16rpx h-28rpx w-8rpx rounded-4rpx bg-[linear-gradient(180deg,#8B7355_0%,#A0826D_100%)]" />
        <text class="text-30rpx text-[#333333] font-semibold">已派单</text>
        <text class="ml-12rpx text-24rpx text-[#A0826D]">{{ dispatchedOrders.length }} 单</text>
      </view>

      <fg-empty v-if="!dispatchedOrders.length" variant="tile" text="暂无派单记录" />

      <view
        v-for="o in dispatchedOrders"
        :key="o.id"
        class="mb-20rpx flex items-center justify-between rounded-24rpx bg-white p-28rpx shadow-[0_4rpx_16rpx_rgba(139,90,60,0.06)]"
      >
        <view class="min-w-0 flex-1">
          <view class="mb-8rpx text-26rpx text-[#5A4A42]">{{ o.id }}</view>
          <view class="text-22rpx text-[#A0826D]">
            {{ o.riderName || '未分配' }} · {{ o.assignedAt || '' }} · {{ SHOP_DISPATCH_STATUS[o.status].text }}
          </view>
        </view>
        <view class="ml-16rpx flex shrink-0 gap-16rpx">
          <wd-button v-if="o.status === 'assigned'" size="small" custom-class="!rounded-32rpx" plain @click="withdraw(o)">
            撤回
          </wd-button>
          <wd-button
            v-if="o.status !== 'done'"
            size="small"
            custom-class="!rounded-32rpx !bg-[#4CAF50] !text-white"
            @click="markDelivered(o)"
          >
            标记送达
          </wd-button>
        </view>
      </view>
    </view>

    <!-- 派单弹窗：选择骑手 -->
    <wd-popup v-model="dispatchVisible" position="bottom" round :safe-area-inset-bottom="true">
      <view class="max-h-70vh overflow-y-auto p-32rpx">
        <view class="mb-8rpx text-32rpx text-[#333333] font-semibold">
          选择骑手
        </view>
        <view class="mb-24rpx text-24rpx text-[#A0826D]">
          订单 {{ dispatchOrder?.id }} · {{ dispatchOrder?.address }}
        </view>

        <view
          v-for="c in candidateRiders"
          :key="c.rider.id"
          class="mb-16rpx flex items-center justify-between rounded-20rpx bg-[#F9F6F2] px-24rpx py-20rpx"
          :class="c.reason ? 'opacity-50' : ''"
          @click="onPick(c.rider, c.reason)"
        >
          <view class="min-w-0 flex-1">
            <view class="mb-6rpx flex items-center gap-12rpx">
              <text class="text-28rpx text-[#333333] font-medium">{{ c.rider.name }}</text>
              <fg-status-tag :meta="statusMeta(c.rider.status)" size="xxs" />
            </view>
            <view class="text-22rpx text-[#A0826D]">
              负载 {{ c.rider.load }}/{{ RIDER_MAX_LOAD }} · {{ c.reason || '可承接新单' }}
            </view>
          </view>
          <view class="i-carbon-chevron-right h-32rpx w-32rpx text-[#C4B5A5]" />
        </view>
      </view>
    </wd-popup>
  </view>
</template>
