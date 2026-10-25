<script setup lang="ts">
/**
 * 会员条形码（Code128，flex 渲染，纯展示）
 */
import { code128Modules } from './code128'

const props = defineProps<{
  code: string
}>()

const bars = computed(() => {
  const modules = code128Modules(props.code || '')
  const total = modules.reduce((s, w) => s + w, 0) || 1
  return modules.map((w, i) => ({ width: `${(w / total) * 100}%`, black: i % 2 === 0 }))
})
</script>

<template>
  <view v-if="bars.length" class="h-full w-full flex">
    <view
      v-for="(bar, idx) in bars"
      :key="idx"
      class="h-full"
      :style="{ width: bar.width, background: bar.black ? '#000' : 'transparent' }"
    />
  </view>
</template>
