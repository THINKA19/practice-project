<script setup lang="ts">
import { computed } from 'vue'
import type { Goods } from '../../models/goods.types'

const props = defineProps<{ tags?: Goods['tags'] }>()

// 标签来自接口：忽略无效项和重复文案，描述字段始终独立保留。
const visibleTags = computed(() => {
  if (!Array.isArray(props.tags))
    return []
  const labels = new Set<string>()
  return props.tags.filter((tag) => {
    if (!tag || typeof tag.label !== 'string' || !tag.label.trim() || labels.has(tag.label.trim()))
      return false
    labels.add(tag.label.trim())
    return true
  }).slice(0, 2)
})
</script>

<template>
  <view v-if="visibleTags.length" class="goods-tags mt-8rpx min-w-0 flex items-center gap-12rpx overflow-hidden">
    <text
      v-for="tag in visibleTags"
      :key="tag.label"
      class="goods-tag min-w-0 truncate leading-32rpx"
      :class="[
        tag.emphasis === 'primary'
          ? [
            'rounded-6rpx px-10rpx py-4rpx text-24rpx font-medium',
            tag.tone === 'green' ? 'bg-[#edf7ef] text-[#387549]' : 'bg-[#fff3e5] text-[#9a612c]',
          ]
          : 'text-20rpx font-normal text-[#8a7b6b]',
      ]"
    >
      {{ tag.label }}
    </text>
  </view>
</template>
