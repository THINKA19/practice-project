<!--
============================================================================
【文件概述】service/favorites/index.vue，负责页面入口与生命周期组装。
【方法与导出清单】默认 Vue 组件。
【综合使用示例】
import View from '@/pages/home/service/favorites/index.vue'
// 由页面或父组件装配 View。
============================================================================
-->
<script setup lang="ts">
import FavoriteCard from './components/FavoriteCard/index.vue'
import { useFavoritesPage } from './composables/use-page'
import ListEnd from '@/components/list-end/index.vue'

definePage({ style: { navigationBarTitleText: '我的收藏', enablePullDownRefresh: true } })
const { items, loading, failed, total, removing, load, remove } = useFavoritesPage()
onShow(() => {
  void load(true)
})
onReachBottom(() => {
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
    <view class="mb-5 rounded-2xl bg-white p-5">
      <text class="block text-2xl font-bold">我的心动清单</text>
      <text class="mt-2 block text-sm text-gray-500">共 {{ total }} 件收藏商品</text>
    </view>
    <FavoriteCard v-for="item in items" :key="item.id" :item="item" :removing="removing === item.id" @remove="remove" />
    <button v-if="failed" @tap="load(true)">
      加载失败，点击重试
    </button>
    <view v-else-if="loading" class="py-6 text-center">
      正在加载收藏…
    </view>
    <view v-else-if="!items.length" class="py-16 text-center text-gray-500">
      还没有收藏商品
    </view>
    <button v-else-if="items.length < total" @tap="load()">
      加载更多
    </button>
    <ListEnd v-else />
  </view>
</template>
