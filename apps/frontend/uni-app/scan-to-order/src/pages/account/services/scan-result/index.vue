<script setup lang="ts">
import { useOrderVerificationDetail } from './composables/use-detail'

definePage({ style: { navigationBarTitleText: '扫码核销' } })
const vm = useOrderVerificationDetail()
const { inputCode, code, detail, loading, scanning, submitting, verified, failed, allowed, canVerify } = vm
onLoad(query => vm.init(query))
onShow(() => vm.refresh())
</script>

<template>
  <view class="min-h-screen bg-[#FFF9F2] px-32rpx py-48rpx">
    <view class="mb-32rpx rounded-24rpx bg-white p-32rpx">
      <view class="mb-16rpx text-36rpx font-semibold">
        扫码核销
      </view>
      <view class="mb-32rpx text-26rpx text-gray-500">
        扫描顾客取餐码，核对订单后确认核销
      </view>
      <wd-button custom-style="background: #4D8A63; border-color: #4D8A63; color: #fff;" block :loading="scanning" :disabled="loading || submitting" @click="vm.scan">
        扫描取餐码
      </wd-button>
      <!-- #ifdef H5 -->
      <view class="mt-16rpx text-24rpx text-gray-500">
        浏览器版暂不支持相机扫码，请手动输入核销码；相机扫码请使用小程序或 App
      </view>
      <!-- #endif -->
      <wd-input v-model="inputCode" label="核销码" placeholder="也可手动输入核销码" clearable custom-class="mt-32rpx" :disabled="loading || submitting || scanning" />
      <wd-button custom-style="color: #A67C52; border-color: #C9935B; background: #FFFAF3;" plain block custom-class="mt-24rpx" :loading="loading" :disabled="!inputCode.trim() || submitting || scanning" @click="vm.loadVerify(inputCode)">
        查询订单
      </wd-button>
      <view v-if="!allowed" class="mt-24rpx text-24rpx text-gray-500">
        核销需要门店账号；顾客登录状态不能用于门店核销
      </view>
    </view>
    <view v-if="failed" class="mb-24rpx rounded-24rpx bg-white p-32rpx text-red-500">
      订单状态未确认，请重新查询后再核销
    </view>
    <view v-if="detail" class="rounded-24rpx bg-white p-32rpx">
      <view class="mb-24rpx break-all text-28rpx">
        核销码：{{ code }}
      </view>
      <view v-for="item in detail.goods" :key="item.id" class="mb-16rpx flex justify-between text-28rpx">
        <text>{{ item.goodsName }}</text><text>× {{ item.number }}</text>
      </view>
      <view class="my-24rpx text-30rpx">
        实付：¥{{ detail.amountReal }}
      </view>
      <view v-if="verified" class="text-green-600">
        订单已核销完成
      </view>
      <wd-button v-else custom-style="background: #4D8A63; border-color: #4D8A63; color: #fff;" block :loading="submitting" :disabled="!canVerify" @click="vm.confirm">
        确认核销
      </wd-button>
      <view v-if="!verified && !canVerify && !submitting" class="mt-16rpx text-24rpx text-gray-500">
        当前订单状态或账号不支持核销
      </view>
    </view>
  </view>
</template>
