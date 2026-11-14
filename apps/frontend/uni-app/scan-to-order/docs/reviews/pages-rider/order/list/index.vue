<script setup lang="ts">
import { RIDER_ORDER_TABS, useRiderOrders } from '../../composables'

definePage({
  style: {
    navigationBarTitleText: '我的配送订单',
    navigationBarBackgroundColor: '#1e7f5c',
    navigationBarTextStyle: 'white',
  },
})
defineOptions({ name: 'RiderOrderList' })

// 装配配送订单：Tab 过滤 + 流转操作（取餐 / 送达 / 转单）
const { activeTab, list, badge, statusMeta, onPickup, onFinish, onCancel, callCustomer } = useRiderOrders()
</script>

<template>
  <view class="min-h-100vh bg-[#F4F6F5] pb-60rpx">
    <!-- Tab 切换 -->
    <view class="sticky top-0 z-10 bg-white shadow-sm">
      <view class="flex items-center px-32rpx">
        <view
          v-for="t in RIDER_ORDER_TABS"
          :key="t.key"
          class="relative mr-48rpx py-28rpx text-28rpx"
          :class="activeTab === t.key ? 'text-[#1e7f5c] font-semibold' : 'text-[#6b7c73]'"
          @click="activeTab = t.key"
        >
          {{ t.label }}（{{ badge(t.key) }}）
          <view v-if="activeTab === t.key" class="absolute bottom-0 left-1/2 h-6rpx w-48rpx -translate-x-1/2 rounded-full bg-[#1e7f5c]" />
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <fg-empty v-if="!list.length" icon="i-carbon-document-blank" text="暂无订单" theme="rider" />

    <!-- 订单列表 -->
    <view v-else class="px-32rpx pt-24rpx">
      <view
        v-for="o in list"
        :key="o.id"
        class="mb-20rpx rounded-24rpx bg-white p-28rpx shadow-[0_4rpx_16rpx_rgba(30,127,92,0.06)]"
      >
        <view class="mb-16rpx flex items-center justify-between">
          <text class="text-24rpx text-[#6b7c73]">{{ o.id }}</text>
          <fg-status-tag :meta="statusMeta(o)" :text="o.statusText" size="sm" />
        </view>

        <view class="mb-12rpx text-28rpx text-[#2f3d36] font-medium">{{ o.shopName }}</view>
        <view class="mb-8rpx text-24rpx text-[#5A6B63]">送达：{{ o.address }}</view>
        <view class="mb-8rpx text-22rpx text-[#8A9A93]">{{ o.goodsSummary }}</view>
        <view class="mb-20rpx text-22rpx text-[#8A9A93]">
          {{ o.customer }} · {{ o.phone }} · {{ o.createdAt }} 下单
        </view>

        <view class="flex items-center justify-between">
          <view>
            <text class="text-24rpx text-[#6b7c73]">配送费</text>
            <text class="ml-8rpx text-32rpx text-[#1e7f5c] font-bold">¥{{ o.deliveryFee }}</text>
          </view>

          <view class="flex items-center gap-16rpx">
            <wd-button size="small" plain custom-class="!rounded-32rpx" @click="callCustomer(o)">
              联系顾客
            </wd-button>
            <wd-button
              v-if="o.status === 'accepted'"
              size="small"
              plain
              custom-class="!rounded-32rpx"
              @click="onCancel(o)"
            >
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
              v-else-if="o.status === 'delivering'"
              size="small"
              custom-class="!rounded-32rpx !bg-[#2f9c74] !text-white"
              @click="onFinish(o)"
            >
              确认送达
            </wd-button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
