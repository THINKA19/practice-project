<script setup lang="ts">
import { privacyPolicy as sections } from './models/policies'
import { AGREEMENT_VERSION } from './'

definePage({ style: { navigationBarTitleText: '隐私协议', disableScroll: true } })
</script>

<template>
  <z-paging fixed :auto="false" :use-page-scroll="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: '#fffaf7' }">
    <view class="p-40rpx text-[#4a3428]">
      <view class="text-40rpx font-bold">
        隐私协议
      </view>
      <view class="my-24rpx text-24rpx text-[#8b6f47]">
        演示版 · 版本 {{ AGREEMENT_VERSION }}
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
  </z-paging>
</template>
