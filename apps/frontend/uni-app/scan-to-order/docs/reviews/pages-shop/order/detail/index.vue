<script lang="ts" setup>
import { useOrderDetail } from './composables'
import { useMerchantGuard } from '@/utils/auth/guards'

definePage({
  style: {
    navigationBarTitleText: '订单详情',
    navigationBarBackgroundColor: '#E68873',
    navigationBarTextStyle: 'white',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantGuard()

const { detail, accept, finish, callCustomer, printTicket } = useOrderDetail()
</script>

<template>
  <view class="min-h-100vh bg-[#F7F2EC] pb-200rpx">
    <!-- 顶部状态 -->
    <view class="bg-[linear-gradient(135deg,#FF9F7F,#E68873)] px-40rpx py-48rpx text-white">
      <view class="mb-16rpx flex items-center justify-between">
        <view class="rounded-full bg-white/20 px-28rpx py-12rpx text-28rpx font-medium backdrop-blur">
          {{ detail.statusText }}
        </view>
        <view class="text-24rpx opacity-90">
          下单时间：{{ detail.createTime }}
        </view>
      </view>
      <view class="text-48rpx font-bold">
        ¥{{ detail.total }}
      </view>
      <view class="mt-8rpx flex items-center text-26rpx opacity-90">
        <view class="mr-20rpx">
          {{ detail.type }} · {{ detail.tableNo }}
        </view>
        <view>共{{ detail.goods.reduce((s, g) => s + g.qty, 0) }}件商品</view>
      </view>
    </view>

    <!-- 进度时间线 -->
    <view class="mx-24rpx rounded-32rpx bg-white p-32rpx shadow -mt-24rpx">
      <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
        订单进度
      </view>
      <view class="relative pl-48rpx">
        <view class="absolute bottom-12rpx left-12rpx top-12rpx w-2rpx bg-[#F0E7DC]" />
        <view
          v-for="(t, i) in detail.timeline"
          :key="i"
          class="relative mb-32rpx last:mb-0"
        >
          <view
            class="absolute top-0 h-24rpx w-24rpx border-4 rounded-full -left-36rpx"
            :class="t.done ? 'border-[#E68873] bg-[#E68873]' : 'border-[#E0CFBC] bg-white'"
          />
          <view class="flex items-baseline justify-between">
            <view class="text-26rpx" :class="[t.done ? 'text-[#5A3A22]' : 'text-[#BDBDBD]']">
              {{ t.s }}
            </view>
            <view class="text-24rpx text-[#A0826D]">
              {{ t.t }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 顾客信息 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx flex items-center justify-between">
        <view class="text-28rpx text-[#5A3A22] font-semibold">
          顾客信息
        </view>
        <wd-button size="small" icon="i-carbon-phone" custom-class="!rounded-32rpx !bg-[#E68873] !text-white" @click="callCustomer">
          联系顾客
        </wd-button>
      </view>
      <view class="text-26rpx text-[#5A4A42] space-y-12rpx">
        <view class="flex justify-between">
          <text class="text-[#A0826D]">姓名</text><text>{{ detail.customer.name }}</text>
        </view>
        <view class="flex justify-between">
          <text class="text-[#A0826D]">电话</text><text>{{ detail.customer.phone }}</text>
        </view>
        <view class="flex justify-between">
          <text class="text-[#A0826D]">用餐人数</text><text>{{ detail.people }}人</text>
        </view>
        <view class="flex justify-between">
          <text class="text-[#A0826D]">支付方式</text><text>{{ detail.payMethod }}</text>
        </view>
      </view>
    </view>

    <!-- 商品清单 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx text-28rpx text-[#5A3A22] font-semibold">
        商品清单
      </view>
      <view class="space-y-20rpx">
        <view v-for="g in detail.goods" :key="g.name" class="flex items-center border-b border-[#F5EDE3] pb-20rpx last:border-0 last:pb-0">
          <view class="flex-1">
            <view class="text-26rpx text-[#5A3A22] font-medium">
              {{ g.name }}
            </view>
            <view class="mt-8rpx text-22rpx text-[#A0826D]">
              {{ g.attr }}
            </view>
          </view>
          <view class="text-26rpx text-[#A0826D]">
            ×{{ g.qty }}
          </view>
          <view class="w-160rpx text-right text-26rpx text-[#8B5A3C] font-medium">
            ¥{{ g.total }}
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view v-if="detail.remark" class="mt-24rpx rounded-16rpx bg-[#FFF8F1] p-20rpx text-24rpx text-[#8B5A3C]">
        📝 备注：{{ detail.remark }}
      </view>

      <!-- 金额明细 -->
      <view class="mt-32rpx border-t border-[#F5EDE3] pt-24rpx text-26rpx space-y-16rpx">
        <view class="flex justify-between">
          <text class="text-[#A0826D]">商品小计</text><text class="text-[#5A4A42]">¥{{ detail.subtotal }}</text>
        </view>
        <view class="flex justify-between">
          <text class="text-[#A0826D]">优惠</text><text class="text-[#F44336]">-¥{{ detail.discount }}</text>
        </view>
        <view class="flex justify-between">
          <text class="text-[#A0826D]">打包费</text><text class="text-[#5A4A42]">¥{{ detail.packFee }}</text>
        </view>
        <view class="flex justify-between border-t border-[#F0E7DC] border-dashed pt-12rpx">
          <text class="text-[#5A3A22] font-semibold">实付金额</text>
          <text class="text-36rpx text-[#E68873] font-bold">¥{{ detail.total }}</text>
        </view>
      </view>
    </view>

    <!-- 订单号信息 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="text-24rpx text-[#A0826D] space-y-12rpx">
        <view class="flex justify-between">
          <text>订单号</text><text class="text-[#5A4A42]">{{ detail.orderNo }}</text>
        </view>
        <view class="flex justify-between">
          <text>支付时间</text><text class="text-[#5A4A42]">{{ detail.payTime }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮栏 -->
    <view class="fixed bottom-0 left-0 right-0 z-20 flex gap-16rpx border-t border-[#F0E7DC] bg-white px-32rpx py-24rpx shadow-[0_-4rpx_20rpx_rgba(0,0,0,0.04)]">
      <wd-button size="large" plain block custom-class="!rounded-48rpx" icon="i-carbon-printer" @click="printTicket">
        打印小票
      </wd-button>

      <template v-if="detail.status === 1">
        <wd-button block size="large" custom-class="!rounded-48rpx !bg-[#E68873] !text-white" @click="accept">
          接单
        </wd-button>
      </template>
      <template v-else-if="detail.status === 2">
        <wd-button block size="large" custom-class="!rounded-48rpx !bg-[#4CAF50] !text-white" @click="finish">
          完成出餐
        </wd-button>
      </template>
      <template v-else>
        <wd-button size="large" disabled block custom-class="!rounded-48rpx">
          {{ detail.statusText }}
        </wd-button>
      </template>
    </view>
  </view>
</template>
