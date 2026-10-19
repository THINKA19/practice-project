<script setup lang="ts">
import { LanguageSwitcher } from '@/components/locale'

definePage({
  type: 'home',
  style: {
    navigationBarTitleText: '首页',
  },
})
</script>

<template>
  <view class="p-6">
    <view class="mb-6">
      <LanguageSwitcher />
    </view>
    <view class="text-xl">
      这是首页测试页面
    </view>
    <view class="mt-2 text-sm text-gray-500">
      src/pages/home/index/index.vue
    </view>
  </view>
</template>
