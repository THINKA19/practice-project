<!--
============================================================================
【文件概述】service/group-buying/components/GroupCard/index.vue，负责页面专属展示组件。
【方法与导出清单】默认 Vue 组件。
【综合使用示例】
import View from '@/pages/home/service/group-buying/components/GroupCard/index.vue'
// 由页面或父组件装配 View。
============================================================================
-->
<script setup lang="ts">
import type { GroupBuying } from '../../models/types'

defineProps<{ item: GroupBuying }>()
defineEmits<{ open: [id: number] }>()
</script>

<template>
  <view class="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm" @tap="$emit('open', item.id)">
    <view class="flex items-center gap-4 p-5">
      <image :src="item.image" class="h-20 w-20 rounded-xl bg-orange-50" mode="aspectFill" />
      <view class="flex-1">
        <text class="block text-lg font-bold">{{ item.name }}</text>
        <text class="mt-2 block text-sm text-gray-500">{{ item.people }} 人团 · 已有 {{ item.joined }} 人参加</text>
        <view class="mt-3 flex gap-3">
          <text class="text-xl text-orange-600 font-bold">¥{{ item.price.toFixed(2) }}</text>
          <text class="text-gray-400 line-through">¥{{ item.originalPrice.toFixed(2) }}</text>
        </view>
      </view>
    </view>
    <view class="bg-orange-100 px-5 py-3 text-sm text-orange-700">
      {{ item.participating ? '已参团，查看进度' : '查看详情与参团规则' }}
    </view>
  </view>
</template>
