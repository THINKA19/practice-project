<!--
============================================================================
【文件概述】service/group-buying-detail/index.vue，负责页面入口与生命周期组装。
【方法与导出清单】默认 Vue 组件。
【综合使用示例】
import View from '@/pages/home/service/group-buying-detail/index.vue'
// 由页面或父组件装配 View。
============================================================================
-->
<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import GroupProgress from './components/GroupProgress/index.vue'
import { useGroupBuyingDetailPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '团购详情', enablePullDownRefresh: true } })
const { item, loading, failed, joining, ended, remaining, canJoin, refresh, join, init } = useGroupBuyingDetailPage()
onLoad((query) => {
  void init(query?.id)
})
onShow(() => {
  if (item.value)
    void refresh()
})
onPullDownRefresh(async () => {
  try {
    await refresh()
  }
  finally {
    uni.stopPullDownRefresh()
  }
})
</script>

<template>
  <view class="min-h-screen bg-orange-50 p-4">
    <view v-if="loading" class="py-10 text-center">
      <PageLoading title="正在加载团购…" />
    </view>
    <button v-if="failed" @tap="refresh()">
      团购不存在或加载失败，点击重试
    </button>
    <template v-if="item">
      <view class="mb-5 rounded-2xl bg-white p-6">
        <image class="h-40 w-full rounded-xl bg-orange-50" :src="item.image" mode="aspectFit" />
        <text class="mt-5 block text-2xl font-bold">{{ item.name }}</text>
        <text class="mt-3 block text-sm text-gray-500">{{ item.description }}</text>
        <view class="mt-4 flex items-center gap-4">
          <text class="text-2xl text-orange-600 font-bold">¥{{ item.price.toFixed(2) }}</text>
          <text class="text-gray-400 line-through">¥{{ item.originalPrice.toFixed(2) }}</text>
        </view>
      </view>
      <GroupProgress :joined="item.joined" :people="item.people" :remaining="remaining" :ended="ended" />
      <view class="my-5 rounded-2xl bg-white p-5">
        <text class="block font-bold">参与说明</text>
        <text class="mt-3 block text-sm text-gray-500">登录顾客账户后参加，每个账户限参加一次。团购满员或到期后停止接受新成员。</text>
      </view>
      <button :disabled="!canJoin" type="primary" @tap="join()">
        {{ joining ? '提交中…' : item.participating ? '已成功参加' : ended ? '已结束' : item.joined >= item.people ? '已满员' : '立即参团' }}
      </button>
    </template>
  </view>
</template>
