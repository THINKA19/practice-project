<script setup lang="ts">
import type { AgreementSection } from '../../models/types'

defineOptions({ name: 'PolicyView' })

defineProps<{ title: string, version: string, sections: AgreementSection[] }>()
</script>

<template>
  <view class="p-40rpx text-[#4a3428]">
    <view class="text-40rpx font-bold">
      {{ title }}
    </view>
    <view class="my-24rpx text-24rpx text-[#8b6f47]">
      演示版 · 版本 {{ version }}
    </view>
    <view v-for="section in sections" :key="section.title" class="mb-40rpx">
      <view class="mb-20rpx text-32rpx font-semibold">
        {{ section.title }}
      </view>
      <view v-for="paragraph in section.paragraphs" :key="paragraph" class="mb-16rpx text-28rpx leading-1.8">
        {{ paragraph }}
      </view>
    </view>
  </view>
</template>
