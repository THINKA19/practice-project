<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import { OrderImage } from '@/components/order-image'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/cart/CartPopup/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import CartPopup from '@/pages/ordering/menu/components/cart/CartPopup/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { CartItem } from '@/pages/ordering/menu-cart'
import { describeCartItem } from '@/pages/ordering/menu-cart'
import { useOrderingLocale as useI18n } from '../../../composables/use-locale'

/**
 * 购物车弹层：清空、商品规格/加料/时段描述、单价、步进器（减到 0 删除）
 * 步进器采用“异步变更”：点击只上报，数量以接口返回为准
 */

defineProps<{
  show: boolean
  items: CartItem[]
  changingItems: Record<string, boolean>
  clearing: boolean
  locked: boolean
  clearBlocked: boolean
}>()

const emit = defineEmits<{
  close: []
  clear: []
  change: [item: CartItem, number: number]
}>()

const { countryCode } = useOrderingCurrency()

const { t } = useI18n()

function stepper(item: CartItem) {
  return (value: number | string) => {
    emit('change', item, Number(value))
    return false
  }
}

function showSelection(item: CartItem) {
  uni.showModal({
    title: item.name,
    content: [item.name, describeCartItem(item)].filter(Boolean).join('\n'),
    showCancel: false,
  })
}
</script>

<template>
  <wd-popup
    :model-value="show"
    position="bottom"
    :z-index="99"
    custom-style="bottom: 120rpx; max-height: 80%; border-radius: 32rpx 32rpx 0 0; overflow-y: auto;"
    @close="emit('close')"
  >
    <view class="cart-header">
      <button class="clear-cart" :disabled="clearBlocked || clearing" @tap="!clearBlocked && !clearing && emit('clear')">
        <PageLoading v-if="clearing" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
        <wd-icon v-if="!clearing" name="delete" size="28rpx" color="#222" />
        <text style="color: #ff4d4f">{{ clearing ? t('cart.clearing') : t('cart.clear') }}</text>
      </button>
    </view>
    <view v-for="item in items" :key="item.key" class="cart-item">
      <OrderImage :src="item.pic" class="h-96rpx w-96rpx shrink-0" />
      <view class="item-description">
        <view class="title" role="button" @tap="showSelection(item)">
          {{ item.name }}
        </view>
        <view v-if="describeCartItem(item)" class="content" role="button" @tap="showSelection(item)">
          {{ describeCartItem(item) }}
        </view>
        <view class="item-controls">
          <view class="price">
            <FgPrice :amount="item.price" :country-code="countryCode" />
          </view>
          <view class="stepper-box">
            <wd-input-number
              :model-value="item.number"
              :min="0"
              input-width="40rpx"
              disable-input
              :disabled="locked || !!changingItems[item.key]"
              :before-change="stepper(item)"
            />
            <view v-if="changingItems[item.key]" class="stepper-loading">
              <PageLoading inline indicator-only size="28rpx" />
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="cart-bottom-fade" aria-hidden="true" />
  </wd-popup>
</template>

<style lang="scss" scoped>
.cart-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 20rpx;
  background: #fff;
}

.clear-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  margin: 0;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
  font-weight: 500;
  line-height: 40rpx;
  color: #222;
  background: #fff0f0;
  border-radius: 999rpx;

  &::after {
    border: none;
  }

  &[disabled] {
    color: #888;
    background: #f8eeee;
  }
}

.cart-bottom-fade {
  position: sticky;
  bottom: 0;
  height: 24rpx;
  margin-top: -24rpx;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #fff);
}

.stepper-box {
  position: relative;
  flex-shrink: 0;
}

.stepper-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 16rpx;
  padding: 24rpx;
  margin: 0 20rpx 16rpx;

  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
  border: 1rpx solid #f5f5f5;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  &:nth-last-of-type(2) {
    margin-bottom: 32rpx;
  }

  .item-description {
    flex: 1 1 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .item-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-top: 12rpx;
  }

  .title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 1.4;
    font-size: 30rpx;
    font-weight: 600;
    color: #2c2416;
  }

  .content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
    margin-top: 4rpx;
    font-size: 24rpx;
    color: #999;
  }

  .price {
    overflow-wrap: anywhere;
    font-size: 28rpx;
    font-weight: 600;
    color: #c93636;
  }
}
</style>
