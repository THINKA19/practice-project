<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】门店详情 / components/ShopPhotoGallery/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import ShopPhotoGallery from '@/pages/ordering/shop-detail/components/ShopPhotoGallery/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import { computed, nextTick, ref } from 'vue'
import ShopImagePreview from '../ShopImagePreview/index.vue'

const props = defineProps<{ photos: string[], active: boolean }>()
const preview = ref<InstanceType<typeof ShopImagePreview>>()
const previewing = ref(false)
const current = ref(0)
const dragging = ref(false)
const moved = ref(false)
let startX = 0
let startY = 0
const autoplay = computed(() => props.active && props.photos.length > 1 && !previewing.value && !dragging.value)

function touchStart(event: { touches: { clientX: number, clientY: number }[] }) {
  const touch = event.touches[0]
  if (!touch)
    return
  startX = touch.clientX
  startY = touch.clientY
  moved.value = false
  dragging.value = true
}
function touchMove(event: { touches: { clientX: number, clientY: number }[] }) {
  const touch = event.touches[0]
  if (touch && (Math.abs(touch.clientX - startX) > 10 || Math.abs(touch.clientY - startY) > 10))
    moved.value = true
}
async function openPreview(index: number) {
  if (moved.value || previewing.value || !props.active || !props.photos[index] || !preview.value)
    return
  current.value = index
  previewing.value = true
  // 先让底层 swiper 应用暂停，再打开预览；不依赖系统预览的 success 回调。
  await nextTick()
  try {
    preview.value?.open({ images: [...props.photos], startPosition: index })
  }
  catch {
    previewing.value = false
  }
}
function change(event: { detail: { current: number } }) {
  if (!previewing.value)
    current.value = event.detail.current
}
function closePreview() {
  previewing.value = false
}
</script>

<template>
  <swiper class="h-full w-full" :current="current" :indicator-dots="photos.length > 1" :autoplay="autoplay" :circular="photos.length > 1" :interval="4500" :duration="450" @change="change" @touchstart="touchStart" @touchmove="touchMove" @touchend="dragging = false" @touchcancel="dragging = false; moved = true">
    <swiper-item v-for="(photo, index) in photos" :key="photo">
      <image class="h-full w-full" mode="aspectFill" :src="photo" @tap="openPreview(index)" />
    </swiper-item>
  </swiper>
  <ShopImagePreview ref="preview" @close="closePreview" />
</template>
