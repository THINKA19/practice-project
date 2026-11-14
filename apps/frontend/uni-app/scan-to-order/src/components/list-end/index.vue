<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <view class="flex items-center justify-center gap-3 py-5 text-sm text-gray-500">
    <view class="h-px w-8 bg-gray-300" />
    <text>{{ t('common.noMore') }}</text>
    <view class="h-px w-8 bg-gray-300" />
  </view>
</template>
