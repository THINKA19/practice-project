<script lang="ts" setup>
import { AREA_TABS, useTableActions, useTableAdmin, useTableList } from './composables'
import { TABLE_STATUS } from '@/constants/status'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '桌台管理',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

const { activeArea, visibleTables, stats } = useTableList()
const { qrVisible, currentTable, tapTable, printCurrentQrcode, markCurrentUsing, markCurrentCleaning } = useTableActions()
const { manageArea, addTable, batchPrint } = useTableAdmin()
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-160rpx">
    <!-- 顶部统计卡片 -->
    <view class="bg-[linear-gradient(135deg,#FF9F7F,#E68873)] px-32rpx pb-40rpx pt-24rpx text-white">
      <view class="mb-24rpx flex items-center justify-between">
        <view class="text-28rpx font-semibold">
          桌台总览
        </view>
        <view class="flex gap-12rpx">
          <wd-button size="small" plain custom-class="!border-white/60 !text-white" @click="manageArea">
            区域管理
          </wd-button>
          <wd-button size="small" custom-class="!bg-white !text-[#E68873]" @click="addTable">
            新增桌台
          </wd-button>
        </view>
      </view>
      <wd-row>
        <wd-col :span="6">
          <view class="border-r border-white/20 text-center">
            <view class="text-56rpx font-bold leading-none">
              {{ stats.all }}
            </view>
            <view class="mt-12rpx text-22rpx opacity-80">
              总桌台
            </view>
          </view>
        </wd-col>
        <wd-col :span="6">
          <view class="border-r border-white/20 text-center">
            <view class="text-56rpx font-bold leading-none">
              {{ stats.free }}
            </view>
            <view class="mt-12rpx text-22rpx opacity-80">
              空闲
            </view>
          </view>
        </wd-col>
        <wd-col :span="6">
          <view class="border-r border-white/20 text-center">
            <view class="text-56rpx font-bold leading-none">
              {{ stats.using }}
            </view>
            <view class="mt-12rpx text-22rpx opacity-80">
              用餐中
            </view>
          </view>
        </wd-col>
        <wd-col :span="6">
          <view class="text-center">
            <view class="text-56rpx font-bold leading-none">
              {{ stats.reserved }}
            </view>
            <view class="mt-12rpx text-22rpx opacity-80">
              已预订
            </view>
          </view>
        </wd-col>
      </wd-row>
    </view>

    <!-- 区域 tab -->
    <view class="sticky top-0 z-10 bg-white">
      <wd-tabs v-model="activeArea" shape="button" color="#E68873" bg-color="#FFF5F0" scrollable sticky>
        <wd-tab v-for="a in AREA_TABS" :key="a.key" :title="a.label" />
      </wd-tabs>
    </view>

    <!-- 桌台网格 -->
    <view class="grid grid-cols-2 gap-20rpx p-24rpx">
      <view
        v-for="t in visibleTables"
        :key="t.id"
        class="relative rounded-32rpx bg-white p-32rpx shadow-[0_4rpx_20rpx_rgba(139,90,60,0.06)] transition-all active:scale-[0.98]"
        :class="t.status === 'using' ? 'ring-2 ring-[#F44336]/40' : ''"
        @click="tapTable(t)"
      >
        <!-- 桌台号 & 座位 -->
        <view class="mb-16rpx flex items-start justify-between">
          <view>
            <view class="text-44rpx text-[#5A3A22] font-bold">
              {{ t.no }}
            </view>
            <view class="mt-4rpx text-22rpx text-[#A0826D]">
              {{ t.area }} · {{ t.seats }}人位
            </view>
          </view>
          <!-- 状态 -->
          <fg-status-tag :meta="TABLE_STATUS[t.status]" size="md" />
        </view>

        <!-- 用餐中：有订单 -->
        <view v-if="t.status === 'using' && t.orderId" class="mt-16rpx rounded-20rpx bg-[#FFEBEE] px-20rpx py-16rpx">
          <view class="flex justify-between text-24rpx">
            <text class="text-[#A0826D]">订单号</text>
            <text class="text-[#F44336] font-medium">{{ t.orderNo?.slice(-8) }}</text>
          </view>
          <view class="mt-8rpx flex justify-between text-24rpx">
            <text class="text-[#A0826D]">用餐人数</text>
            <text class="text-[#5A3A22] font-medium">{{ t.people ?? '—' }}人</text>
          </view>
          <view class="mt-16rpx text-center text-22rpx text-[#F44336]">
            👆 点击查看订单详情
          </view>
        </view>

        <!-- 已预订 -->
        <view v-else-if="t.status === 'reserved'" class="mt-16rpx rounded-20rpx bg-[#E3F2FD] px-20rpx py-16rpx">
          <view class="text-24rpx text-[#2196F3]">
            📅 {{ t.reserveTime }} · {{ t.reserveName }}
          </view>
        </view>

        <!-- 清洁中：手动置为清洁中的桌台没有倒计时文案，避免出现「预计剩余 」空值 -->
        <view v-else-if="t.status === 'cleaning'" class="mt-16rpx rounded-20rpx bg-[#FFF8E1] px-20rpx py-16rpx text-24rpx text-[#FF9800]">
          🧹 清洁中<text v-if="t.cleanTimer"> · 预计剩余 {{ t.cleanTimer }}</text>
        </view>

        <!-- 用餐中：线下开台（无关联订单） -->
        <view v-else-if="t.status === 'using'" class="mt-16rpx rounded-20rpx bg-[#FFF5F0] px-20rpx py-16rpx text-center text-22rpx text-[#E68873]">
          🍽️ 已入座 · 点击查看 / 打印桌码
        </view>

        <!-- 空闲：扫码提示 -->
        <view v-else class="mt-16rpx rounded-20rpx bg-[#E8F5E9] px-20rpx py-16rpx text-center text-22rpx text-[#4CAF50]">
          📷 点击查看 / 打印桌码
        </view>
      </view>
    </view>

    <!-- 二维码弹窗 -->
    <wd-popup v-model="qrVisible" position="center" :round="32" :style="{ width: '85%' }">
      <view v-if="currentTable" class="p-48rpx">
        <view class="mb-24rpx text-center">
          <view class="text-36rpx text-[#5A3A22] font-bold">
            桌台 {{ currentTable.no }} 扫码点餐码
          </view>
          <view class="mt-8rpx text-24rpx text-[#A0826D]">
            {{ currentTable.area }} · {{ currentTable.seats }}人位
          </view>
        </view>

        <!-- 模拟二维码占位 -->
        <view class="mx-auto mb-24rpx h-440rpx w-440rpx flex items-center justify-center border-2 border-[#E68873] rounded-24rpx border-dashed bg-[#FFF5F0]">
          <view class="text-center">
            <view class="i-carbon-qr-code mx-auto mb-16rpx h-160rpx w-160rpx text-[#E68873]" />
            <view class="text-24rpx text-[#A0826D]">
              （真实二维码接入后替换此处）
            </view>
          </view>
        </view>

        <view class="mb-32rpx text-center text-24rpx text-[#8B5A3C]">
          顾客扫码 → 选择商品 → 支付 → 订单自动推送到商家后台
        </view>

        <view class="space-y-16rpx">
          <wd-button
            block
            size="large"
            custom-class="!rounded-48rpx !bg-[#E68873] !text-white"
            icon="i-carbon-printer"
            @click="printCurrentQrcode"
          >
            打印桌台码
          </wd-button>
          <wd-row :gutter="16">
            <wd-col :span="12">
              <wd-button size="large" plain block custom-class="!rounded-48rpx !text-[#FF9800]" @click="markCurrentCleaning">
                清洁中
              </wd-button>
            </wd-col>
            <wd-col :span="12">
              <wd-button block size="large" custom-class="!rounded-48rpx !bg-[#4CAF50] !text-white" @click="markCurrentUsing">
                手动开台
              </wd-button>
            </wd-col>
          </wd-row>
        </view>
      </view>
    </wd-popup>

    <!-- 浮动批量打印 -->
    <view
      class="fixed bottom-40rpx right-32rpx z-20 h-120rpx flex items-center gap-12rpx rounded-full bg-[linear-gradient(135deg,#FF9F7F,#E68873)] px-36rpx text-white shadow-[0_12rpx_32rpx_rgba(230,136,115,0.45)]"
      @click="batchPrint"
    >
      <view class="i-carbon-printer h-48rpx w-48rpx" />
      <text class="text-28rpx font-medium">批量打印桌码</text>
    </view>
  </view>
</template>
