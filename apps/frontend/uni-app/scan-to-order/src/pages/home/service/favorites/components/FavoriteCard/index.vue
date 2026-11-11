<!--
============================================================================
【文件概述】service/favorites/components/FavoriteCard/index.vue，负责页面专属展示组件。
【方法与导出清单】默认 Vue 组件。
【综合使用示例】
import View from '@/pages/home/service/favorites/components/FavoriteCard/index.vue'
// 由页面或父组件装配 View。
============================================================================
-->
<script setup lang="ts">
import type { FavoriteItem } from '../../models/types'

const props = defineProps<{ item: FavoriteItem, removing: boolean }>()
defineEmits<{ remove: [item: FavoriteItem] }>()
const imageFailed = ref(false)
watch(() => props.item.picUrl, () => {
  imageFailed.value = false
})
</script>

<template>
  <view class="mb-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
    <image v-if="item.picUrl && !imageFailed" class="h-20 w-20 shrink-0 rounded-xl bg-orange-50" :src="item.picUrl" mode="aspectFill" @error="imageFailed = true" />
    <view v-else class="h-20 w-20 flex shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xs text-gray-500">
      暂无图片
    </view>
    <view class="flex-1">
      <text class="block text-base font-bold">{{ item.goodsName }}</text>
      <text class="mt-2 block text-xs text-gray-500">收藏于 {{ item.collectTime }}</text>
      <text class="mt-2 block text-lg text-orange-600">¥{{ item.price.toFixed(2) }}</text>
    </view>
    <button size="mini" :disabled="removing" @tap="$emit('remove', item)">
      {{ removing ? '处理中' : '取消收藏' }}
    </button>
  </view>
</template>
