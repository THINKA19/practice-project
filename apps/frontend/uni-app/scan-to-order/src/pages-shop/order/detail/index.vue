<!--
============================================================================
商家订单详情
============================================================================

【文件概述】
独立详情路由，组装订单进度、顾客信息、菜品及履约操作。

【方法与导出清单】
- 默认导出：uni-app 页面入口。

【综合使用示例】
```typescript
import { ShopRoutes } from '@/pages-shop/routes'
uni.navigateTo({ url: ShopRoutes.Operations.orderDetail + '?id=A-ORDER-1' })
```
============================================================================
-->
<script lang="ts" setup>
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useOrderDetail } from './composables/useOrderDetail'
import { merchantCurrency, useMerchantPage } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeLifecycle } from '@/pages-shop/shop/index'

definePage({
  style: {
    navigationBarTitleText: '订单详情',
  },
})

// 登录态守卫：未登录 → 登录页，非商家角色 → 客户端首页
useMerchantNoticeLifecycle(useMerchantPage())

const { detail, reference, pickupVerificationRequired, accept, finish, deliver, resolveCustomerPhone, printTicket, context, loaded, loading, error } = useOrderDetail()

onShow(() => uni.setNavigationBarTitle({ title: t('shop.messages.orderDetails') }))
watch(() => t('shop.messages.orderDetails'), title => uni.setNavigationBarTitle({ title }))
</script>

<template>
  <view v-if="!loaded" class="p-32rpx">
    <PageLoading v-if="loading" />
    <text v-else>{{ st(error || '订单不存在') }}</text>
  </view>
  <view v-else class="min-h-100vh bg-[#f5f7f6] pb-200rpx">
    <!-- 顶部状态 -->
    <view class="bg-[linear-gradient(135deg,#39a86b,#16834a)] px-40rpx py-48rpx text-white">
      <view class="mb-16rpx flex items-center justify-between">
        <view class="rounded-full bg-white/20 px-28rpx py-12rpx text-28rpx font-medium backdrop-blur">
          {{ st(detail.statusText) }}
        </view>
        <view v-if="detail.createTime" class="text-24rpx opacity-90">
          {{ detail.createTime }}
        </view>
      </view>
      <view v-if="detail.total !== undefined" class="text-48rpx font-bold">
        <FgPrice :amount="detail.total" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" />
      </view>
      <view class="mt-8rpx flex items-center text-26rpx opacity-90">
        <view class="mr-20rpx">
          {{ st(reference.label) }} {{ reference.value }} · {{ st(detail.type) }}
        </view>
        <view>{{ st('共') }}{{ st(detail.goods.reduce((s, g) => s + g.qty, 0)) }}{{ st('件商品') }}</view>
      </view>
    </view>

    <!-- 进度时间线 -->
    <view class="mx-24rpx rounded-32rpx bg-white p-32rpx shadow -mt-24rpx">
      <view class="mb-24rpx text-28rpx text-[#17392a] font-semibold">
        {{ st('订单进度') }}
      </view>
      <view class="relative pl-48rpx">
        <view class="absolute bottom-12rpx left-12rpx top-12rpx w-2rpx bg-[#F0E7DC]" />
        <view
          v-for="(entry, i) in detail.timeline"
          :key="i"
          class="relative mb-32rpx last:mb-0"
        >
          <view
            class="absolute top-0 h-24rpx w-24rpx border-4 rounded-full -left-36rpx"
            :class="entry.done ? 'border-[#16834a] bg-[#16834a]' : 'border-[#E0CFBC] bg-white'"
          />
          <view class="flex items-baseline justify-between">
            <view class="text-26rpx" :class="[entry.done ? 'text-[#17392a]' : 'text-[#BDBDBD]']">
              {{ st(entry.s) }}
            </view>
            <view class="text-24rpx text-[#237a50]">
              {{ st(entry.t) }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 顾客信息 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx flex items-center justify-between">
        <view class="text-28rpx text-[#17392a] font-semibold">
          {{ st('顾客信息') }}
        </view>
        <PhoneContact :key="detail.orderNo" :phone="detail.customer.phone" :resolve-phone="resolveCustomerPhone">
          <template #trigger="{ open }">
            <wd-button size="small" icon="i-carbon-phone" custom-class="!rounded-32rpx !bg-[#16834a] !text-white" @click="open">
              {{ st('联系顾客') }}
            </wd-button>
          </template>
        </PhoneContact>
      </view>
      <view class="text-26rpx text-[#5A4A42] space-y-12rpx">
        <view class="flex justify-between">
          <text class="text-[#237a50]">{{ st('姓名') }}</text><text>{{ st(detail.customer.name) }}</text>
        </view>
        <view class="flex justify-between">
          <text class="text-[#237a50]">{{ st('电话') }}</text><text>{{ st(detail.customer.phone) }}</text>
        </view>
        <view v-if="detail.people" class="flex justify-between">
          <text class="text-[#237a50]">{{ st('用餐人数') }}</text><text>{{ st(detail.people) }}人</text>
        </view>
        <view v-if="detail.payMethod && context.can('order.amount.read')" class="flex justify-between">
          <text class="text-[#237a50]">{{ st('支付方式') }}</text><text>{{ st(detail.payMethod) }}</text>
        </view>
      </view>
    </view>

    <!-- 商品清单 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="mb-24rpx text-28rpx text-[#17392a] font-semibold">
        {{ st('商品清单') }}
      </view>
      <view class="space-y-20rpx">
        <view v-for="g in detail.goods" :key="g.name" class="flex items-center border-b border-[#e5eee8] pb-20rpx last:border-0 last:pb-0">
          <view class="flex-1">
            <view class="text-26rpx text-[#17392a] font-medium">
              {{ st(g.name) }}
            </view>
            <view class="mt-8rpx text-22rpx text-[#237a50]">
              {{ st(g.attr) }}
            </view>
          </view>
          <view class="text-26rpx text-[#237a50]">
            ×{{ st(g.qty) }}
          </view>
          <view v-if="g.total !== undefined" class="w-160rpx text-right text-26rpx text-[#8B5A3C] font-medium">
            <FgPrice :amount="g.total" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" />
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view v-if="detail.remark" class="mt-24rpx rounded-16rpx bg-[#f5f7f6] p-20rpx text-24rpx text-[#8B5A3C]">
        {{ st('备注') }} {{ st(detail.remark) }}
      </view>

      <!-- 金额明细 -->
      <view v-if="detail.total !== undefined" class="mt-32rpx border-t border-[#e5eee8] pt-24rpx text-26rpx space-y-16rpx">
        <view v-if="detail.subtotal !== undefined" class="flex justify-between">
          <text class="text-[#237a50]">{{ st('商品小计') }}</text><text class="text-[#5A4A42]"><FgPrice :amount="detail.subtotal" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" /></text>
        </view>
        <view v-if="detail.discount !== undefined" class="flex justify-between">
          <text class="text-[#237a50]">{{ st('优惠') }}</text><text class="text-[#F44336]">-<FgPrice :amount="detail.discount" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" /></text>
        </view>
        <view v-if="detail.packFee !== undefined" class="flex justify-between">
          <text class="text-[#237a50]">{{ st('打包费') }}</text><text class="text-[#5A4A42]"><FgPrice :amount="detail.packFee" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" /></text>
        </view>
        <view class="flex justify-between border-t border-[#F0E7DC] border-dashed pt-12rpx">
          <text class="text-[#17392a] font-semibold">{{ st('实付金额') }}</text>
          <text class="text-36rpx text-[#16834a] font-bold"><FgPrice :amount="detail.total" :currency-code="merchantCurrency(context.current)" amount-unit="settlement" /></text>
        </view>
      </view>
    </view>

    <!-- 订单号信息 -->
    <view class="mx-24rpx mt-24rpx rounded-32rpx bg-white p-32rpx shadow-sm">
      <view class="text-24rpx text-[#237a50] space-y-12rpx">
        <view class="flex justify-between">
          <text>{{ st('订单号') }}</text><text class="text-[#5A4A42]">{{ st(detail.orderNo) }}</text>
        </view>
        <view v-if="detail.payTime" class="flex justify-between">
          <text>{{ st('支付时间') }}</text><text class="text-[#5A4A42]">{{ st(detail.payTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮栏 -->
    <view class="fixed bottom-0 left-0 right-0 z-20 flex gap-16rpx border-t border-[#F0E7DC] bg-white px-32rpx py-24rpx shadow-[0_-4rpx_20rpx_rgba(0,0,0,0.04)]">
      <wd-button v-if="context.can('order.amount.read')" size="large" plain block custom-class="!rounded-48rpx" icon="i-carbon-printer" @click="printTicket">
        {{ st('打印小票') }}
      </wd-button>

      <template v-if="detail.status === 1 && context.can('order.accept')">
        <wd-button block size="large" custom-class="!rounded-48rpx !bg-[#16834a] !text-white" @click="accept">
          {{ st('接单') }}
        </wd-button>
      </template>
      <template v-else-if="detail.status === 2 && context.can('order.prepare')">
        <wd-button block size="large" custom-class="!rounded-48rpx !bg-[#4CAF50] !text-white" @click="finish">
          {{ st('完成出餐') }}
        </wd-button>
      </template>
      <template v-else-if="detail.status === 3 && (detail.type === '堂食' || detail.type === '自取') && context.can(detail.type === '堂食' ? 'order.serve' : 'order.pickup.verify')">
        <wd-button block @click="deliver">
          {{ st(detail.type === '堂食' ? '确认已上菜' : pickupVerificationRequired ? '自取核销' : '确认已取餐') }}
        </wd-button>
      </template>
      <template v-else>
        <wd-button size="large" disabled block custom-class="!rounded-48rpx">
          {{ st(detail.statusText) }}
        </wd-button>
      </template>
    </view>
  </view>
</template>
