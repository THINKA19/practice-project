<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】门店详情 / components/ShopImagePreview/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import ShopImagePreview from '@/pages/ordering/shop-detail/components/ShopImagePreview/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import { ref } from 'vue'
import WdOverlay from '@wot-ui/ui/components/wd-overlay/wd-overlay.vue'
import WdIcon from '@wot-ui/ui/components/wd-icon/wd-icon.vue'

const emit = defineEmits<{ open: [], close: [] }>()
const visible = ref(false)
const images = ref<string[]>([])
const current = ref(0)
const zoom = ref(1)
function open(options: { images: string[], startPosition: number }) {
  if (!options.images[options.startPosition])
    return
  images.value = [...options.images]
  current.value = options.startPosition
  zoom.value = 1
  visible.value = true
  emit('open')
}
function close() {
  visible.value = false
  images.value = []
  emit('close')
}
function select(index: number) {
  if (index < 0 || index >= images.value.length)
    return
  current.value = index
  zoom.value = 1
}
function change(event: { detail: { current: number } }) {
  select(event.detail.current)
}
function scale(event: { detail: { scale: unknown } }, index: number) {
  const value = event.detail.scale
  if (index === current.value && typeof value === 'number' && Number.isFinite(value))
    zoom.value = Math.min(4, Math.max(1, value))
}
defineExpose({ open, close })
</script>

<template>
  <WdOverlay :show="visible" :z-index="2000" :lock-scroll="true">
    <view v-if="visible" class="image-preview" @tap.stop>
      <view class="preview-toolbar">
        <text>{{ current + 1 }} / {{ images.length }}</text>
        <button class="preview-control preview-close" aria-label="关闭预览" @tap.stop="close">
          <WdIcon name="close" size="20px" />
        </button>
      </view>
      <view class="preview-stage">
        <swiper class="preview-images" :current="current" :autoplay="false" :circular="false" :disable-touch="zoom > 1" @change="change">
          <swiper-item v-for="(image, index) in images" :key="`${index}-${image}`">
            <movable-area class="preview-area">
              <movable-view class="preview-area" direction="all" :disabled="zoom <= 1" scale :scale-min="1" :scale-max="4" :scale-value="index === current ? zoom : 1" @scale="scale($event, index)">
                <image class="preview-area" :src="image" mode="aspectFit" />
              </movable-view>
            </movable-area>
          </swiper-item>
        </swiper>
        <!-- #ifdef H5 -->
        <template v-if="images.length > 1">
          <button class="preview-control preview-arrow preview-previous" aria-label="上一张" :disabled="current === 0" @tap.stop="select(current - 1)">
            <WdIcon name="arrow-left" size="20px" />
          </button>
          <button class="preview-control preview-arrow preview-next" aria-label="下一张" :disabled="current === images.length - 1" @tap.stop="select(current + 1)">
            <WdIcon name="arrow-right" size="20px" />
          </button>
        </template>
        <!-- #endif -->
      </view>
      <!-- #ifdef H5 -->
      <view class="preview-zoom">
        <button class="preview-control" aria-label="缩小图片" :disabled="zoom <= 1" @tap.stop="zoom = Math.max(1, zoom - 0.5)">
          −
        </button>
        <text>{{ Math.round(zoom * 100) }}%</text>
        <button class="preview-control" aria-label="放大图片" :disabled="zoom >= 4" @tap.stop="zoom = Math.min(4, zoom + 0.5)">
          ＋
        </button>
      </view>
      <!-- #endif -->
    </view>
  </WdOverlay>
</template>

<style scoped>
.image-preview {
  position: fixed;
  inset: 0;
  color: white;
  background: #111;
}
.preview-stage {
  position: absolute;
  top: calc(68px + env(safe-area-inset-top));
  right: 0;
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: 0;
}
.preview-images {
  width: 100%;
  height: 100%;
}
.preview-area {
  width: 100%;
  height: 100%;
}
.preview-toolbar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
}
.preview-control {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  margin: 0;
  font-size: 18px;
  color: #333;
  background: #fff;
  border-radius: 22px;
  line-height: 1;
}
.preview-control::after {
  border: 0;
}
.preview-close {
  width: 44px;
  height: 44px;
  color: #fff;
  background: transparent;
}
.preview-control[disabled] {
  color: #888;
  background: #444;
  cursor: not-allowed;
}
.preview-arrow {
  display: none;
  position: absolute;
  top: 50%;
  z-index: 2;
  transform: translateY(-50%);
}
.preview-previous {
  left: 12px;
}
.preview-next {
  right: 12px;
}
.preview-zoom {
  position: absolute;
  right: 0;
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: 0;
  display: none;
  gap: 16px;
  align-items: center;
  justify-content: center;
}
/* #ifdef H5 */
@media (hover: hover) and (pointer: fine) {
  .preview-arrow,
  .preview-zoom {
    display: flex;
  }
  .preview-stage {
    bottom: calc(80px + env(safe-area-inset-bottom));
  }
}
/* #endif */
</style>
