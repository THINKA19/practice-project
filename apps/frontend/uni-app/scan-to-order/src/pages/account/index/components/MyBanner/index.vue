<script setup lang="ts">
/* eslint-disable project-mock/boundaries -- 按页面资源要求复用轮播图片，仅导入静态资源 */
import banner01 from '@/mock/assets/images/home/banner/01.jpeg'
import banner02 from '@/mock/assets/images/home/banner/02.jpeg'
import banner03 from '@/mock/assets/images/home/banner/03.jpeg'

defineOptions({ name: 'MyBanner' })
/* eslint-enable project-mock/boundaries */

const emit = defineEmits<{ select: [destination: string] }>()

const banners = [
  { image: banner01, destination: '优惠券' },
  { image: banner02, destination: '每日签到' },
  { image: banner03, destination: '预约订座' },
]
</script>

<template>
  <view class="mx-32rpx mt-32rpx overflow-hidden rounded-24rpx">
    <swiper
      class="h-240rpx w-full"
      :vertical="false"
      circular
      autoplay
      :interval="3000"
      :duration="500"
      indicator-dots
      indicator-color="#c9cbd4"
      indicator-active-color="#ffffff"
    >
      <swiper-item v-for="banner in banners" :key="banner.image">
        <image
          :src="banner.image"
          mode="aspectFill"
          class="block h-full w-full"
          @tap="emit('select', banner.destination)"
        />
      </swiper-item>
    </swiper>
  </view>
</template>
