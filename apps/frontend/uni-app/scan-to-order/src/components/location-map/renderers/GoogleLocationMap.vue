<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ source: string }>()
const source = computed(() => props.source)
const revision = ref(0)
const slow = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
function clearTimer() {
  clearTimeout(timer)
}
function begin() {
  clearTimer()
  slow.value = false
  if (source.value) {
    timer = setTimeout(() => {
      slow.value = true
    }, 20000)
  }
}
function retry() {
  revision.value++
  begin()
}
function loaded() {
  // 跨域 iframe 的 load 只表示文档结束加载，不能据此宣称地图瓦片可用。
  clearTimer()
}
function failed() {
  clearTimer()
  slow.value = true
}
watch(source, begin, { immediate: true })
onBeforeUnmount(clearTimer)
</script>

<template>
  <view class="h-full w-full flex flex-col">
    <iframe v-if="source" :key="source + revision" :src="source" class="min-h-0 w-full flex-1 border-0" style="display: block;" title="Google 位置地图" allowfullscreen referrerpolicy="no-referrer-when-downgrade" @load="loaded" @error="failed" />
    <view v-else class="h-full flex items-center justify-center p-32rpx text-26rpx text-[#665647]">
      暂无位置或地址
    </view>
    <view v-if="source" class="flex shrink-0 items-center justify-between gap-16rpx bg-white p-16rpx text-24rpx text-[#665647]">
      <text>{{ slow ? '地图加载较慢，可重试。' : '地图未显示？可重试。' }}</text>
      <button class="m-0 shrink-0 text-24rpx" size="mini" @tap="retry">
        重试
      </button>
    </view>
  </view>
</template>
