<script setup lang="ts">
import { OrderImage } from '@/components/order-image'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】结算与支付 / components/PayGoodsCard/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import PayGoodsCard from '@/pages/ordering/menu-pay/components/PayGoodsCard/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/**
 * 结算页 - 商品清单卡片（纯展示）
 */
import type { CartItem } from '@/pages/ordering/menu-cart'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import { describeCartItem, isCartItemShortage } from '@/pages/ordering/menu-cart'

defineProps<{
  goodsList: CartItem[]
  totalNumber: number
  totalPrice: number
}>()

const { currencySymbol, currencyUnit, currencyName } = useOrderingCurrency()

const { t } = useI18n()

function showSelection(item: CartItem) {
  uni.showModal({
    title: item.name,
    content: [item.name, describeCartItem(item)].filter(Boolean).join('\n'),
    showCancel: false,
  })
}
</script>

<template>
  <view class="card goods-card">
    <view class="card-title flex items-center justify-between">
      <text>商品清单</text>
      <view class="title-decoration" />
    </view>
    <view class="mb-24rpx">
      <view v-for="(item, index) in goodsList" :key="index" class="goods-item">
        <view class="flex items-start">
          <OrderImage :src="item.pic" class="mr-16rpx h-96rpx w-96rpx shrink-0" />
          <view class="min-w-0 flex-1">
            <view class="flex items-center gap-8rpx">
              <view class="goods-name min-w-0 flex-1" :class="{ quehuo: isCartItemShortage(item) }" role="button" @tap="showSelection(item)">
                {{ item.name }}
              </view>
              <wd-tag v-if="isCartItemShortage(item)" type="danger">
                {{ t('goodsDetail.storeing') }}
              </wd-tag>
            </view>
            <view v-if="describeCartItem(item)" class="goods-specs" role="button" @tap="showSelection(item)">
              {{ describeCartItem(item) }}
            </view>
            <view class="goods-controls">
              <view class="goods-price">
                {{ currencySymbol }}{{ item.price }}{{ currencyUnit }}
              </view>
              <view class="goods-quantity">
                ×{{ item.number }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="goods-total">
      <text class="mr-16rpx text-28rpx text-#666">
        商品小计
      </text>
      <text class="mr-32rpx text-28rpx text-#666">
        ×{{ totalNumber }}
      </text>
      <text class="text-36rpx text-#c93636 font-bold">
        {{ currencySymbol }}{{ totalPrice }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
      </text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card {
  padding: 32rpx;
  margin: 0 24rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgb(139 90 60 / 8%);
}

.card-title {
  position: relative;
  padding-left: 20rpx;
  margin-bottom: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #2c2c2c;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 8rpx;
    height: 32rpx;
    content: '';
    background: linear-gradient(180deg, #d4a574 0%, #c99960 100%);
    border-radius: 4rpx;
    transform: translateY(-50%);
  }
}

.title-decoration {
  width: 80rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #d4a574 0%, transparent 100%);
  border-radius: 3rpx;
}

.goods-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.goods-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 30rpx;
  font-weight: 500;
  line-height: 1.4;
  color: #2c2c2c;

  &.quehuo {
    color: #bbb;
    text-decoration: line-through;
  }
}

.goods-specs {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 24rpx;
  line-height: 1.6;
  color: #999;
}

.goods-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 12rpx;
}

.goods-quantity {
  min-width: 60rpx;
  font-size: 28rpx;
  color: #666;
  text-align: center;
}

.goods-price {
  min-width: 100rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #d4a574;
  text-align: left;
}

.goods-total {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 24rpx 0 8rpx;
  border-top: 1rpx solid #f5f5f5;
}
</style>
