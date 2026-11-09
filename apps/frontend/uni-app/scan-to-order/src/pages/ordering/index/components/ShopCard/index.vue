<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / components/ShopCard/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import ShopCard from '@/pages/ordering/index/components/ShopCard/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/**
 * 门店卡片：仅用轻量标识展示真实的当前门店。
 */
import { ref, watch } from 'vue'
import ShopLabels from '../ShopLabels/index.vue'
import ShopBusinessBadge from '../ShopBusinessBadge/index.vue'
import type { Shop } from '../../models/types'
import { useShopPhoneContact } from '../../composables/use-phone-contact'
import ShopPhoneDialog from '../ShopPhoneDialog/index.vue'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

const props = defineProps<{
  shop: Shop
  nearest: boolean
  selected?: boolean
  selectText: string
}>()

const emit = defineEmits<{ select: [shop?: Shop] }>()
const phoneContact = useShopPhoneContact(() => props.shop.linkPhone)
const { phone } = phoneContact
function navigateToShop() {
  void navigate(ClientRoutes.Ordering.shopLocation, { id: props.shop.id })
}
function previewPhoto() {
  const urls = [...new Set([props.shop.pic, ...(props.shop.photos || [])]
    .filter((url): url is string => typeof url === 'string' && !!url.trim()))]
  if (props.shop.pic && urls.includes(props.shop.pic))
    uni.previewImage({ current: props.shop.pic, urls })
}
const imageFailed = ref(false)
const imageStyle = ref({ width: '100%', height: '100%' })
watch(() => props.shop.pic, () => {
  imageFailed.value = false
  imageStyle.value = { width: '100%', height: '100%' }
})
function onImageLoad(event: { detail: { width: number | string, height: number | string } }) {
  const width = Number(event.detail.width)
  const height = Number(event.detail.height)
  if (width > 0 && height > 0 && Math.max(width, height) < 98)
    imageStyle.value = { width: `${width}px`, height: `${height}px` }
}
</script>

<template>
  <view class="shop-card" :class="{ 'shop-card-selected': selected }">
    <view class="mb-28rpx flex flex-wrap items-center gap-12rpx">
      <view class="max-w-full min-w-0">
        <text class="shop-name">
          {{ shop.name }}
        </text>
      </view>
      <ShopBusinessBadge :shop="shop" />
      <text v-if="selected" class="text-22rpx text-[#8b4513]">当前门店</text>
    </view>
    <ShopLabels :shop="shop" show-enter @enter="emit('select', $event)" />
    <view class="shop-content-row">
      <view class="shop-photo">
        <image v-if="shop.pic && !imageFailed" class="h-full w-full" :style="imageStyle" :src="shop.pic" mode="aspectFill" lazy-load @tap.stop="previewPhoto" @load="onImageLoad" @error="imageFailed = true" />
        <view v-else class="h-full flex items-center justify-center text-[#8b4513]">
          <wd-icon name="shop" size="48rpx" />
        </view>
      </view>
      <view class="min-w-0 flex-1">
        <view class="shop-info">
          <view v-if="shop.address" class="info-item">
            <view class="info-icon">
              <wd-icon name="location" size="28rpx" color="#A0826D" />
            </view>
            <text class="info-text address-text">
              {{ shop.address }}
            </text>
          </view>
          <view class="info-item">
            <view class="info-icon">
              <wd-icon name="clock-circle" size="28rpx" color="#A0826D" />
            </view>
            <text class="info-text">
              {{ shop.openingHours }}
            </text>
          </view>
          <view class="info-item">
            <view class="info-icon">
              <wd-icon name="phone" size="28rpx" color="#A0826D" />
            </view>
            <text class="info-text">
              {{ shop.linkPhone }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <view class="shop-actions">
      <button class="shop-quick-action" :disabled="!phone" :aria-label="phone ? `联系${shop.name}` : '门店暂未提供电话'" @tap.stop="phoneContact.open()">
        <wd-icon name="phone" size="32rpx" />
        <text>电话</text>
      </button>
      <button class="shop-quick-action" :aria-label="`导航到${shop.name}`" @tap.stop="navigateToShop">
        <wd-icon name="location" size="32rpx" />
        <text>导航</text>
      </button>
    </view>
    <view class="mt-28rpx">
      <view class="select-btn select-btn-secondary" :class="{ 'select-btn-selected': selected }" @tap="emit('select')">
        <text>{{ selectText }}</text>
      </view>
    </view>
    <ShopPhoneDialog :success-visible="phoneContact.successVisible.value" :copy-fallback-available="phoneContact.copyFallbackAvailable.value" :model-value="phoneContact.visible.value" :phone="phoneContact.phone.value" :message="phoneContact.message.value" :copying="phoneContact.copying.value" @fallback="phoneContact.showCopyFallback()" @update:model-value="phoneContact.close()" @copy="phoneContact.copy()" />
  </view>
</template>

<style lang="scss" scoped>
.shop-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.shop-quick-action {
  display: flex;
  flex: 1;
  gap: 12rpx;
  min-width: 0;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 88rpx;
  padding: 8rpx 0;
  margin: 0;
  font-size: 22rpx;
  line-height: 32rpx;
  color: #8b4513;
  background: #fff9f0;
  border-radius: 16rpx;

  &::after {
    border: none;
  }

  &[disabled] {
    color: #aaa;
    background: #f5f5f5;
  }
}

.shop-content-row {
  display: flex;
  gap: 24rpx;
  align-items: flex-start;
}

.shop-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 172rpx;
  height: 172rpx;
  overflow: hidden;
  background: #f5e6d3;
  border-radius: 16rpx;
}

.shop-card {
  position: relative;
  padding: 32rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgb(139 69 19 / 8%);
}

.shop-name {
  display: -webkit-box;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
  color: #2c1810;
}

.shop-card-selected {
  background: #fff9f0;
  box-shadow:
    inset 0 0 0 3rpx #d4a574,
    0 8rpx 24rpx rgb(139 69 19 / 12%);

  .shop-quick-action:not([disabled]) {
    background: #fff;
    border: 1rpx solid #e8d4b8;
  }
}

.select-btn-secondary.select-btn-selected {
  color: #fff;
  background: linear-gradient(135deg, #c09a6b 0%, #d4a574 100%);
  border-color: #c09a6b;
}

.shop-info {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  min-height: 172rpx;
  justify-content: flex-start;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
  background: #fff9f0;
  border-radius: 12rpx;
}

.info-text {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 26rpx;
  line-height: 48rpx;
  color: #5a4a42;
}

.address-text {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.select-btn {
  display: flex;
  gap: 8rpx;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 600;
  border-radius: 44rpx;
}

.select-btn-secondary {
  color: #8b4513;
  background: linear-gradient(135deg, #f5e6d3 0%, #ffe4c4 100%);
  border: 2rpx solid #d4af37;
}
</style>
