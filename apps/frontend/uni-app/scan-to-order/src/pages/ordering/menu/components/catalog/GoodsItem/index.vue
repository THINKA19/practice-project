<script setup lang="ts">
import GoodsTags from '../GoodsTags.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/catalog/GoodsItem/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import GoodsItem from '@/pages/ordering/menu/components/catalog/GoodsItem/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { Goods } from '../../../models/goods.types'

/**
 * 商品卡片（纯展示）：layout 1 一行一个 / 2 一行两个
 */

defineProps<{
  goods: Goods
  layout: 1 | 2
  showSellerNumber: boolean
}>()

const emit = defineEmits<{
  open: []
  add: []
}>()

const { currencySymbol, currencyUnit, currencyName } = useOrderingCurrency()
</script>

<template>
  <view :class="layout === 1 ? 'list1' : 'list2'">
    <image class="img" mode="aspectFill" :src="goods.pic" @tap="emit('open')" />
    <view class="goods-info">
      <view class="title ellipsis" @tap="emit('open')">
        {{ goods.name }}
      </view>
      <GoodsTags :tags="goods.tags" />
      <view v-if="goods.characteristic" class="characteristic line-clamp-1">
        {{ goods.characteristic }}
      </view>
      <view class="price">
        {{ currencySymbol }}{{ goods.minPrice }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
        <text v-if="goods.originalPrice && goods.originalPrice > 0" class="original-price">{{ currencySymbol }}{{ goods.originalPrice }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text></text>
      </view>
      <view class="buy-info">
        <view v-if="showSellerNumber" class="num">
          已售 {{ goods.numberSells }}
        </view>
        <image class="car" src="/static/images/icon/car.svg" @tap.stop="emit('add')" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ellipsis {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.original-price {
  margin-left: 16rpx;
  font-size: 24rpx;
  font-weight: 400;
  color: var(--app-text-muted, #6f6258);
  text-decoration: line-through;
}

.price-symbol {
  margin-right: 2rpx;
  font-weight: 600;
}

.characteristic {
  overflow: hidden;
  font-size: 24rpx;
  color: #a08b6f;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  font-weight: 500;
  line-height: 1.4;
  color: #3d2817;
}

.price {
  font-weight: 700;
  color: #c93636;
}

.num {
  font-weight: 400;
  color: #c4a57b;
}

.car {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  box-sizing: border-box;
  background: var(--app-brand-primary, #8b4513);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgb(139 69 19 / 16%);

  &:active {
    transform: scale(0.9);
  }
}

.buy-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

/* 一行一个 */
.list1 {
  position: relative;
  display: flex;
  margin: 20rpx 0;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgb(139 111 71 / 8%);

  .img {
    flex-shrink: 0;
    width: 240rpx;
    height: 240rpx;
    background: linear-gradient(135deg, #fff5e6 0%, #ffe8d6 50%);
    border-radius: 20rpx 0 0 20rpx;
  }

  .goods-info {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    justify-content: space-between;
    padding: 20rpx 32rpx 16rpx 24rpx;
  }

  .title {
    margin-bottom: 8rpx;
    font-size: 30rpx;
  }

  .characteristic {
    margin: 6rpx 0;
  }

  .price {
    padding-top: 12rpx;
    margin-top: auto;
    font-size: 38rpx;

    .price-symbol {
      font-size: 28rpx;
    }
  }

  .num {
    font-size: 24rpx;
  }

  .car {
    width: 60rpx;
    height: 60rpx;
    padding: 14rpx;
  }
}

/* 一行两个 */
.list2 {
  position: relative;
  width: 345rpx;
  margin: 20rpx 0;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 28rpx rgb(139 111 71 / 10%);

  .img {
    display: block;
    width: 345rpx;
    height: 345rpx;
    background: linear-gradient(135deg, #fff5e6 0%, #ffe8d6 50%);
  }

  .goods-info {
    position: relative;
    padding: 20rpx 20rpx 80rpx;
  }

  .title {
    min-height: 78rpx;
    font-size: 28rpx;
  }

  .characteristic {
    margin-top: 8rpx;
  }

  .price {
    margin-top: 12rpx;
    font-size: 36rpx;

    .price-symbol {
      font-size: 26rpx;
    }
  }

  .num {
    font-size: 22rpx;
  }

  .car {
    width: 64rpx;
    height: 64rpx;
    padding: 16rpx;
  }
}
</style>
