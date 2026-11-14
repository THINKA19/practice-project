<!--
============================================================================
【文件概述】service/welfare/index.vue，负责页面入口与生命周期组装。
【方法与导出清单】默认 Vue 组件。
【综合使用示例】
import View from '@/pages/home/service/welfare/index.vue'
// 由页面或父组件装配 View。
============================================================================
-->
<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import { CouponCard, CouponPwdDialog } from '../../user/coupons'
import { useWelfarePage } from './composables/use-page'
import ListEnd from '@/components/list-end/index.vue'

definePage({ style: { navigationBarTitleText: '福利中心', enablePullDownRefresh: true } })
const isDemo = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
const vm = useWelfarePage()
const { templates, loading, failed, finished } = vm
const { fetching, fetchingId, showPwdPop, couponPwd } = vm.fetch
onShow(() => {
  void vm.refresh()
})
onReachBottom(() => {
  void vm.loadMore()
})
onPullDownRefresh(async () => {
  try {
    await vm.refresh()
  }
  finally {
    uni.stopPullDownRefresh()
  }
})
</script>

<template>
  <view class="min-h-screen bg-orange-50 p-4">
    <view class="mb-6 rounded-2xl bg-white p-6">
      <text class="block text-2xl text-orange-700 font-bold">茶友福利中心</text>
      <text class="mt-3 block text-sm text-gray-500">普通券可直接领取，口令专享券需输入活动口令。已领取的券可在首页「优惠券」查看。</text>
    </view>
    <CouponCard
      v-for="item in templates"
      :key="item.id"
      variant="fetch"
      :money-type="item.moneyType"
      :amount="item.moneyMin"
      :threshold="item.moneyHreshold"
      :name="item.name"
      :badge="item.pwd ? '口令专享券' : '普通福利券'"
      :desc="item.pwd ? '需要活动口令' : '领取后可在优惠券查看'"
      :action-text="vm.fetch.isClaimed(item) ? '已领取' : fetchingId === item.id ? '领取中…' : item.pwd ? '输入口令' : '立即领取'"
      :disabled="fetchingId === item.id || vm.fetch.isClaimed(item)"
      @action="vm.fetch.claimCoupon(item)"
    />
    <button v-if="failed" @tap="vm.refresh()">
      加载失败，点击重试
    </button>
    <view v-else-if="loading" class="py-6 text-center">
      <PageLoading title="正在加载福利…" />
    </view>
    <view v-else-if="!templates.length" class="py-12 text-center">
      暂无可领取福利
    </view>
    <button v-else-if="!finished" @tap="vm.loadMore()">
      加载更多
    </button>
    <ListEnd v-else />
    <CouponPwdDialog
      v-if="showPwdPop"
      v-model="couponPwd"
      :title="isDemo ? '请输入领券口令（演示：DEMO）' : '请输入领券口令'"
      confirm-text="领取"
      :submitting="fetching"
      @close="vm.fetch.closePassword"
      @confirm="vm.fetch.confirmPassword"
    />
  </view>
</template>
