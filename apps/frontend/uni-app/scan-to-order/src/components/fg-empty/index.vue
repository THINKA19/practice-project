<script setup lang="ts">
defineProps<{ icon: string, text: string }>()
</script>

<template>
  <view class="flex flex-col items-center gap-8px py-32px text-sm text-[var(--app-text-muted)]">
    <view class="text-24px" :class="icon" aria-hidden="true" />
    <text>{{ text }}</text>
  </view>
</template>
