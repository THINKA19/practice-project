<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
/**
 * ============================================================================
 * 【文件概述】店内收藏入口，与选店列表共享顾客收藏状态。
 * 【方法与导出清单】默认组件：shopId 指定收藏对象，加载失败支持重试。
 * 【综合使用示例】import { ShopFavorite } from '@/pages/ordering/index'; // 页面绑定 shopId 为当前门店 ID
 * ============================================================================
 */
import { watch } from 'vue'
import { useShopFavorites } from '../../favorites'
import { useSessionState } from '@/pages/auth/session'

defineProps<{ shopId: number }>()
const favorites = useShopFavorites()
const session = useSessionState()
watch(() => session.sessionRevision, () => {
  void favorites.load()
}, { immediate: true })
</script>

<template>
  <button class="favorite-button m-0 shrink-0 rounded-16rpx bg-[#fff9f0] px-20rpx py-8rpx text-24rpx text-[#8b4513]" :disabled="favorites.loading || favorites.saving" @tap.stop="favorites.error ? favorites.load() : favorites.toggle(shopId)">
    <PageLoading v-if="favorites.loading && !favorites.error" inline size="28rpx" title="加载收藏…" />
    <text v-else>{{ favorites.error ? '重试收藏' : favorites.ids.includes(shopId) ? '★ 已收藏' : '☆ 收藏' }}</text>
  </button>
</template>

<style lang="scss" scoped>
.favorite-button::after {
  border: none;
}
</style>
