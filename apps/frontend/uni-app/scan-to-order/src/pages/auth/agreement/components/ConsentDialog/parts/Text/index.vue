<script setup lang="ts">
defineOptions({ name: 'ConsentText' })
defineProps<{ paragraphs: string[], readLabel: string }>()
const emit = defineEmits<{ read: [] }>()
</script>

<template>
  <view class="pt-8rpx">
    <view v-for="(paragraph, index) in paragraphs" :key="index" class="privacy-paragraph pb-24rpx text-28rpx text-[#666]">
      {{ paragraph }}
    </view>
    <view class="pb-24rpx text-28rpx text-[#018d71]" @tap="emit('read')">
      {{ readLabel }}
    </view>
  </view>
</template>

<style scoped>
.privacy-paragraph {
  line-height: 1.8;
}
</style>
