<script setup lang="ts">
import FgPrice from '@/components/fg-price/fg-price.vue'
import type { SkuGroup } from './types'
import { useSkuSelector } from './use-sku-selector'

const props = defineProps<{ groups: SkuGroup[], countryCode?: string }>()
const emit = defineEmits<{ select: [groupId: number, choiceId: number] }>()
const { select } = useSkuSelector(() => props.groups, (g, c) => emit('select', g, c))
</script>

<template>
  <view class="goods-sku-selector">
    <view v-for="group in groups" :key="group.id" class="mb-32rpx">
      <view class="mb-16rpx text-28rpx font-semibold">
        {{ group.name }}
      </view>
      <view class="flex flex-wrap gap-16rpx">
        <view
          v-for="choice in group.choices"
          :key="choice.id"
          class="sku-choice"
          :class="{ active: choice.active, disabled: choice.disabled }"
          role="button"
          :aria-pressed="choice.active"
          :aria-disabled="!!choice.disabled"
          @tap="select(group.id, choice.id)"
        >
          {{ choice.name }}<text v-if="choice.price != null" class="ml-8rpx">{{ choice.isSurcharge ? '+' : '' }}<FgPrice :amount="choice.price" :country-code="countryCode" /></text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.sku-choice {
  padding: 16rpx 28rpx;
  font-size: 28rpx;
  color: #666;
  background: var(--app-brand-soft, #f8f1e8);
  border: 2rpx solid #e8e8e8;
  border-radius: 16rpx;
  &.active {
    color: #fff;
    background: var(--app-brand-primary, #8b4513);
    border-color: var(--app-brand-primary, #8b4513);
  }
  &.disabled {
    opacity: 0.4;
  }
}
</style>
