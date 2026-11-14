<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useHomePromotion } from './composables/use-promotion'

const props = defineProps<{ pageVisible: boolean }>()
const emit = defineEmits<{ select: [] }>()
const { promotion, promotionVisible, onPromotionLoad, onPromotionError } = useHomePromotion(() => props.pageVisible)

function select() {
  promotionVisible.value = false
  emit('select')
}

const { t } = useI18n()
</script>

<template>
  <wd-popup
    v-if="promotion"
    v-model="promotionVisible"
    position="center"
    root-portal
    :z-index="2000"
    :lazy-render="false"
    :close-on-click-modal="false"
    custom-style="background: transparent; overflow: visible;"
  >
    <view class="promotion-frame">
      <button class="promotion-close" :aria-label="t('home.promotion.close')" @tap="promotionVisible = false">
        <text aria-hidden="true">×</text>
      </button>
      <view class="promotion-poster">
        <image
          class="promotion-image"
          :src="promotion.picUrl"
          :aria-label="promotion.title || t('home.promotion.title')"
          mode="aspectFit"
          @load="onPromotionLoad"
          @error="onPromotionError"
        />
        <button class="promotion-action" @tap="select">
          {{ t('home.promotion.action') }}
        </button>
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.promotion-frame {
  position: relative;
  width: 76vw;
  max-width: 348px;
  padding-top: 52px;
}

.promotion-poster {
  overflow: hidden;
  background: #244e40;
  border-radius: 24rpx;
}

.promotion-image {
  display: block;
  width: 100%;
  height: min(100vw, 62vh, 464px);
}

.promotion-action,
.promotion-close {
  &::after {
    border: 0;
  }
}

.promotion-action {
  width: 100%;
  font-size: 28rpx;
  line-height: 80rpx;
  color: #244e40;
  background: #f6dfae;
  border-radius: 0;
}

.promotion-close {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  margin: 0;
  font-size: 28px;
  line-height: 1;
  color: #fff;
  background: rgb(0 0 0 / 72%);
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 50%;
}
</style>
