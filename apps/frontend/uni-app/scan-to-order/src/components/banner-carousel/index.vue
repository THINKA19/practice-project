<script setup lang="ts" generic="T extends BannerCarouselItem">
import type { BannerCarouselItem } from './types'
import { useCarousel } from './use-carousel'

const props = withDefaults(defineProps<{
  items: T[]
  height?: string
  radius?: string
  label?: string
}>(), {
  height: '150rpx',
  radius: '16rpx',
  label: '',
})
const emit = defineEmits<{ select: [item: T] }>()
const { slides, images, multiple, select } = useCarousel(props, item => emit('select', item))
</script>

<template>
  <view v-if="slides.length" class="banner-carousel" :style="{ height, borderRadius: radius }">
    <wd-swiper :list="images" :height="height" :autoplay="multiple" :indicator="multiple" image-mode="aspectFill" @click="select" />
    <text v-if="label" class="carousel-label">{{ label }}</text>
  </view>
</template>

<style lang="scss" scoped src="./index.scss" />
