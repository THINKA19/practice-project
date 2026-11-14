<script setup lang="ts">
import { shopText } from '@/locale/shop-text'

defineProps<{
  meta: { text: string, color: string, bg: string }
  text?: string
  size: 'xs' | 'md' | 'lg'
}>()

const sizes = { xs: 'text-xs', md: 'text-sm', lg: 'text-base' }
</script>

<template>
  <text
    class="inline-block rounded-full px-8px py-2px"
    :class="sizes[size]"
    :style="{ color: meta.color, backgroundColor: meta.bg }"
  >
    {{ shopText(text || meta.text) }}
  </text>
</template>
