<script setup lang="ts">
defineOptions({ name: 'AuthPageShell' })
defineProps<{ title: string }>()
</script>

<template>
  <z-paging fixed :auto="false" :use-page-scroll="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: 'linear-gradient(180deg,#ffede8 0%,#fffaf7 100%)' }">
    <view class="box-border w-full p-40rpx pb-80rpx">
      <view class="mb-32rpx mt-48rpx text-center text-44rpx text-[#4a3428] font-bold">
        {{ title }}
      </view>
      <view class="rounded-24rpx bg-white p-32rpx shadow-sm">
        <slot />
      </view>
    </view>
  </z-paging>
</template>
