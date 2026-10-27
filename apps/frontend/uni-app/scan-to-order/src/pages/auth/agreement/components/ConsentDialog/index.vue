<script setup lang="ts">
import ConsentText from './parts/Text/index.vue'
import type { DialogProps } from './types'

defineOptions({ name: 'ConsentDialog' })

defineProps<DialogProps>()
const emit = defineEmits<{ read: [], accept: [], reject: [] }>()
</script>

<template>
  <wd-popup :model-value="visible" position="bottom" :z-index="2000" root-portal round custom-style="overflow: hidden;" :close-on-click-modal="false" :closable="false">
    <view class="privacy-sheet px-40rpx pt-40rpx pb-safe">
      <view class="privacy-heading text-center text-34rpx text-[#333] font-semibold">
        {{ title }}
      </view>
      <!-- #ifdef H5 -->
      <div class="privacy-description privacy-description--h5" role="region" :aria-label="title" tabindex="0" @wheel.stop @touchmove.stop>
        <ConsentText :paragraphs="paragraphs" :read-label="readLabel" @read="emit('read')" />
      </div>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <scroll-view scroll-y enhanced :bounces="false" :show-scrollbar="false" class="privacy-description privacy-description--native" style="height: 38vh;">
        <ConsentText :paragraphs="paragraphs" :read-label="readLabel" @read="emit('read')" />
      </scroll-view>
      <!-- #endif -->
      <view class="privacy-actions flex flex-col gap-20rpx pb-32rpx pt-24rpx">
        <!-- #ifdef MP-WEIXIN -->
        <button id="privacy-consent-agree" open-type="agreePrivacyAuthorization" class="privacy-button privacy-button--accept" @agreeprivacyauthorization="emit('accept')">
          {{ acceptLabel }}
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <button class="privacy-button privacy-button--accept" @tap="emit('accept')">
          {{ acceptLabel }}
        </button>
        <!-- #endif -->
        <button class="privacy-button privacy-button--reject" @tap="emit('reject')">
          {{ rejectLabel }}
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<style scoped>
.privacy-sheet {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-height: 90vh;
  overflow: hidden;
  background: #fff;
}
.privacy-heading {
  flex-shrink: 0;
  padding-bottom: 24rpx;
  line-height: 1.5;
  background: #fff;
}
.privacy-description {
  height: 38vh;
  min-height: 0;
  flex: 0 1 38vh;
}
.privacy-description--native {
  overflow: hidden;
}
/* #ifdef H5 */
.privacy-description--h5 {
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
/* #endif */
.privacy-actions {
  flex-shrink: 0;
  background: #fff;
}
.privacy-button {
  width: 100%;
  margin: 0;
  padding: 20rpx 12rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.5;
}
.privacy-button::after {
  border: none;
}
.privacy-button--accept {
  color: #fff;
  background: #169b50;
}
.privacy-button--reject {
  color: #666;
  background: #f7f7f7;
}
</style>
