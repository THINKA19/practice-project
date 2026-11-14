<script lang="ts" setup>
import { useOrderActions, useOrderList } from './composables'
import { SHOP_ORDER_STATUS, SHOP_ORDER_TABS } from '@/constants/status'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '订单管理',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

const { activeTab, list, badge, findOrder } = useOrderList()
const { goDetail, acceptOrder, finishOrder, cancelOrder } = useOrderActions(findOrder)
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-80rpx">
    <!-- Tab 切换：顶部固定 -->
    <view class="sticky top-0 z-10 bg-white shadow-sm">
      <wd-tabs v-model="activeTab" shape="line" color="#E68873" line-width="40" sticky>
        <wd-tab v-for="(t, i) in SHOP_ORDER_TABS" :key="t.key" :title="t.label" :badge="{ value: badge(i), max: 99 }" />
      </wd-tabs>
    </view>

    <!-- 空状态 -->
    <fg-empty v-if="list.length === 0" icon="i-carbon-document-blank" text="暂无相关订单" />

    <!-- 订单列表 -->
    <view v-else class="p-24rpx space-y-24rpx">
      <view
        v-for="item in list"
        :key="item.id"
        class="rounded-32rpx bg-white p-32rpx shadow-[0_4rpx_20rpx_rgba(139,90,60,0.06)]"
        @click="goDetail(item.id)"
      >
        <!-- 头部：单号 + 桌号/类型 + 状态 + 时间 -->
        <view class="mb-24rpx flex items-center justify-between">
          <view class="flex items-center">
            <view class="mr-16rpx text-26rpx text-[#5A4A42] font-medium">
              {{ item.tableNo }}
            </view>
            <view class="rounded-full bg-[#FFF5E4] px-16rpx py-4rpx text-22rpx text-[#8B5A3C]">
              {{ item.type }}
            </view>
          </view>
          <fg-status-tag :meta="SHOP_ORDER_STATUS[item.status]" :text="item.statusText" size="lg" />
        </view>

        <!-- 商品列表 -->
        <view class="mb-24rpx border-y border-[#F5EDE3] py-20rpx space-y-12rpx">
          <view v-for="g in item.goods" :key="g.name" class="flex items-center justify-between text-26rpx">
            <view class="text-[#5A3A22]">
              {{ g.name }}<text class="ml-8rpx text-[#A0826D]">×{{ g.qty }}</text>
            </view>
            <view class="text-[#8B5A3C]">
              ¥{{ g.price }}
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view v-if="item.remark" class="mb-24rpx rounded-16rpx bg-[#FFF8F1] px-20rpx py-16rpx text-24rpx text-[#8B5A3C]">
          📝 {{ item.remark }}
        </view>

        <!-- 底部：金额 + 操作按钮 -->
        <view class="flex items-center justify-between">
          <view>
            <text class="text-24rpx text-[#A0826D]">订单号 {{ item.id }} · {{ item.time }}</text>
            <view class="mt-8rpx">
              合计 <text class="text-36rpx text-[#E68873] font-bold">¥{{ item.amount }}</text>
            </view>
          </view>

          <!-- 按钮组（不同状态不同操作） -->
          <view class="flex gap-16rpx" @click.stop>
            <!-- 待接单：接单 / 拒单 -->
            <template v-if="item.status === 1">
              <wd-button size="small" custom-class="!rounded-32rpx" plain @click="cancelOrder(item.id)">
                拒单
              </wd-button>
              <wd-button size="small" custom-class="!rounded-32rpx !bg-[#E68873] !text-white" @click="acceptOrder(item.id)">
                接单
              </wd-button>
            </template>
            <!-- 制作中：完成出餐 -->
            <template v-else-if="item.status === 2">
              <wd-button size="small" custom-class="!rounded-32rpx !bg-[#4CAF50] !text-white" @click="finishOrder(item.id)">
                完成出餐
              </wd-button>
            </template>
            <!-- 其他：查看详情 -->
            <template v-else>
              <wd-button size="small" custom-class="!rounded-32rpx" plain @click="goDetail(item.id)">
                查看详情
              </wd-button>
            </template>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
