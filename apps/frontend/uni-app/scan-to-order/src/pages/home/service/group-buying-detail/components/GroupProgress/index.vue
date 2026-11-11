<!--
============================================================================
【文件概述】service/group-buying-detail/components/GroupProgress/index.vue，负责页面专属展示组件。
【方法与导出清单】默认 Vue 组件。
【综合使用示例】
import View from '@/pages/home/service/group-buying-detail/components/GroupProgress/index.vue'
// 由页面或父组件装配 View。
============================================================================
-->
<script setup lang="ts">
defineProps<{ joined: number, people: number, remaining: string, ended: boolean }>()
</script>

<template>
  <view class="rounded-2xl bg-white p-5">
    <text class="block text-lg font-bold">拼团进度</text>
    <view class="my-4 flex flex-wrap gap-3">
      <view v-for="n in Math.min(people, 12)" :key="n" class="h-12 w-12 flex items-center justify-center rounded-full" :class="n <= joined ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'">
        {{ n <= joined ? '已加入' : '待加入' }}
      </view>
    </view>
    <text class="block">已加入 {{ joined }} / {{ people }} 人</text>
    <text class="mt-3 block text-sm text-orange-600">{{ joined >= people ? '已成团' : ended ? '已结束，未成团' : `还差 ${people - joined} 人，剩余 ${remaining}` }}</text>
  </view>
</template>
