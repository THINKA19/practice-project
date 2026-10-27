<script setup lang="ts">
import type { ActivityGalleryGroup, ActivityGalleryImage } from '../../models/types'
import { useHorizontalScroll } from './use-gallery'
import { t } from '@/locale'

defineOptions({ name: 'ServiceGalleryGroup' })

defineProps<{ group: ActivityGalleryGroup, groupIndex: number }>()
const emit = defineEmits<{
  preview: [images: ActivityGalleryImage[], current: ActivityGalleryImage]
  more: [group: ActivityGalleryGroup]
}>()
const GROUP_THEMES = [
  'bg-[linear-gradient(135deg,#FFF0F0_0%,#FFE4E1_100%)]',
  'bg-[linear-gradient(135deg,#F0F8FF_0%,#E4EDFF_100%)]',
  'bg-[linear-gradient(135deg,#F0FFF0_0%,#E1FFE1_100%)]',
  'bg-[linear-gradient(135deg,#FFF8DC_0%,#FFEDCC_100%)]',
]

/**
 * 横向滚动适配（H5/PC 拖拽 + 左右箭头，移动端由 scroll-view 原生触摸滚动处理）
 * 每组按 group.id 隔离状态，互不干扰
 */
const {
  getState,
  setRef,
  onScroll,
  handleMouseDown,
  scrollBy,
  canScroll,
} = useHorizontalScroll()
</script>

<template>
  <view
    class="ml-32rpx mr-132rpx mt-40rpx"
  >
    <!-- 标题 -->
    <wd-row align="middle" justify="space-between">
      <wd-col :span="14">
        <view class="flex items-center pl-8rpx text-32rpx text-[#4a3428] font-semibold">
          <view class="mr-16rpx h-32rpx w-8rpx shrink-0 rounded-4rpx bg-[linear-gradient(180deg,#c79373_0%,#d4a574_100%)]" />
          {{ group.titleKey ? t(group.titleKey) : group.title }}
        </view>
      </wd-col>
      <wd-col :span="10">
        <view class="flex justify-end" @click="emit('more', group)">
          <text class="text-26rpx text-[#999999]">
            {{ t('service.more') }} ›
          </text>
        </view>
      </wd-col>
    </wd-row>

    <!-- 横向滚动图：scroll-view scroll-x + enable-flex + flex-nowrap -->
    <view
      class="relative mt-24rpx rounded-24rpx p-24rpx"
      :class="GROUP_THEMES[groupIndex % GROUP_THEMES.length]"
    >
      <scroll-view
        :ref="(el) => setRef(group.id, el)"
        :scroll-left="getState(group.id).left"
        scroll-with-animation
        scroll-x
        enable-flex
        :show-scrollbar="false"
        class="h-360rpx w-full whitespace-nowrap"
        @scroll="onScroll(group.id)($event)"
      >
        <view
          class="flex flex-nowrap select-none gap-24rpx"
          :class="getState(group.id).dragging ? 'cursor-grabbing' : 'cursor-grab'"
          @mousedown="(e) => handleMouseDown(group.id, e)"
        >
          <view
            v-for="(item, index) in group.images"
            :key="`${group.id}-${index}`"
            class="relative h-312rpx w-280rpx flex-shrink-0 overflow-hidden rounded-20rpx bg-white shadow-[0_4rpx_16rpx_rgba(0,0,0,0.08)]"
            @click="!getState(group.id).dragMoved && emit('preview', group.images, item)"
            @touchstart="getState(group.id).dragMoved = false"
          >
            <wd-img
              :src="item.url"
              width="280rpx"
              height="312rpx"
              custom-class="rounded-20rpx"
            />
            <!-- 图片底部渐变遮罩 + 标签 -->
            <view class="absolute bottom-0 left-0 right-0 bg-[linear-gradient(transparent,rgba(0,0,0,0.6))] px-20rpx py-16rpx">
              <text class="text-24rpx text-white">
                {{ group.titleKey ? t('service.image', { index: index + 1 }) : item.label }}
              </text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 左右箭头：除 App-NVUE 外所有端都可见（H5 PC 浏览器、微信小程序 PC 模拟器等） -->
      <!-- #ifdef H5 -->
      <button
        :class="canScroll(group.id, -1) ? 'bg-white/95 text-[#333] cursor-pointer' : 'bg-[#f2f2f2] text-[#b8b8b8] cursor-not-allowed'"
        class="absolute left-12rpx top-1/2 z-10 m-0 h-80rpx w-80rpx flex items-center justify-center border border-white/60 rounded-full p-0 shadow-[0_6rpx_18rpx_rgba(0,0,0,0.18)] transition-all duration-200 -translate-y-1/2 active:scale-90 hover:bg-white hover:shadow-[0_8rpx_22rpx_rgba(0,0,0,0.22)]"
        hover-class="scale-90"
        :disabled="!canScroll(group.id, -1)"
        :aria-disabled="!canScroll(group.id, -1)"
        :aria-label="t('service.previous')"
        @click="scrollBy(group.id, -1)"
      >
        <wd-icon name="arrow-left" size="24px" />
      </button>
      <button
        :class="canScroll(group.id, 1) ? 'bg-white/95 text-[#333] cursor-pointer' : 'bg-[#f2f2f2] text-[#b8b8b8] cursor-not-allowed'"
        class="absolute right-12rpx top-1/2 z-10 m-0 h-80rpx w-80rpx flex items-center justify-center border border-white/60 rounded-full p-0 shadow-[0_6rpx_18rpx_rgba(0,0,0,0.18)] transition-all duration-200 -translate-y-1/2 active:scale-90 hover:bg-white hover:shadow-[0_8rpx_22rpx_rgba(0,0,0,0.22)]"
        hover-class="scale-90"
        :disabled="!canScroll(group.id, 1)"
        :aria-disabled="!canScroll(group.id, 1)"
        :aria-label="t('service.next')"
        @click="scrollBy(group.id, 1)"
      >
        <wd-icon name="arrow-right" size="24px" />
      </button>
      <!-- #endif -->
    </view>
  </view>
</template>
