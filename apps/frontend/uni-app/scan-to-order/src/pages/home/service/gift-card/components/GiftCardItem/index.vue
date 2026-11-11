<script setup lang="ts">
/**
 * 可购买的礼品卡（纯展示）
 */
import type { CardTemplate } from '../../models/types'
import { ref, watch } from 'vue'

defineOptions({ name: 'GiftCardItem' })

const props = defineProps<{
  card: CardTemplate
  buyText: string
}>()
const emit = defineEmits<{ buy: [] }>()
const imageFailed = ref(false)
watch(() => props.card.pic, () => {
  imageFailed.value = false
})
</script>

<template>
  <view class="gift-card-item">
    <view class="card-container">
      <view class="card-image-wrapper">
        <image class="h-full w-full" :src="!imageFailed && card.pic ? card.pic : '/static/images/gift-card/classic.png'" mode="aspectFill" @error="imageFailed = true" />
        <view class="card-shine" />
      </view>
      <view class="p-24rpx">
        <view class="mb-20rpx text-28rpx text-#333 font-600 leading-snug">
          {{ card.name }}
        </view>
        <view class="flex items-center justify-between">
          <view class="flex items-baseline text-#A0826D">
            <text class="mr-4rpx text-28rpx font-600">
              ¥
            </text>
            <text class="text-34rpx font-700">
              {{ card.price ?? card.amount }}
            </text>
          </view>
          <button class="buy-btn" @tap="emit('buy')">
            <text>{{ buyText }}</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.gift-card-item {
  min-width: 0;
}

.card-container {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(160 130 109 / 12%);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 210rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%);
}

.card-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgb(255 255 255 / 35%) 50%, transparent 70%);
  transform: translateX(-100%);
  animation: card-shine 750ms ease-out 1 both;
}
@keyframes card-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .card-shine {
    animation: none;
  }
}
.buy-btn::after {
  border: 0;
}
.buy-btn {
  margin: 0;
  line-height: 1.5;
  padding: 12rpx 16rpx;
  font-size: 22rpx;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #a0826d 0%, #8b6f47 100%);
  border-radius: 48rpx;
  box-shadow: 0 6rpx 20rpx rgb(160 130 109 / 30%);
}
</style>
