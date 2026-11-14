<!--
============================================================================
【文件概述】service/group-buying/index.vue，负责页面入口与生命周期组装。
【方法与导出清单】默认 Vue 组件。
【综合使用示例】
import View from '@/pages/home/service/group-buying/index.vue'
// 由页面或父组件装配 View。
============================================================================
-->
<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import GroupCard from './components/GroupCard/index.vue'
import { useGroupBuyingPage } from './composables/use-page'
import ListEnd from '@/components/list-end/index.vue'

definePage({ style: { navigationBarTitleText: '团购专区', enablePullDownRefresh: true } })
const { items, loading, failed, total, finished, load, retry, open } = useGroupBuyingPage()
onShow(() => {
  void load(true)
})
onReachBottom(() => {
  if (!failed.value)
    void load()
})
onPullDownRefresh(async () => {
  try {
    await load(true)
  }
  finally {
    uni.stopPullDownRefresh()
  }
})
</script>

<template>
  <view class="min-h-screen bg-orange-50 p-4">
    <view class="mb-6 rounded-2xl bg-white p-6">
      <text class="block text-2xl font-bold">好茶一起享</text>
      <text class="mt-3 block text-sm text-gray-500">共 {{ total }} 个团购活动，邀请茶友一起参加</text>
    </view>
    <GroupCard v-for="item in items" :key="item.id" :item="item" @open="open" />
    <button v-if="failed" @tap="retry()">
      加载失败，点击重试
    </button>
    <view v-else-if="loading" class="py-6 text-center">
      <PageLoading title="团购加载中…" />
    </view>
    <view v-else-if="!items.length" class="py-12 text-center">
      暂无团购活动
    </view>
    <ListEnd v-else-if="finished" />
  </view>
</template>
