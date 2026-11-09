<script setup lang="ts">
import { computed } from 'vue'
import GoodsSkuSelector from '@/components/goods-sku-selector/index.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'
/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/catalog/QuickSkuPanel/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import QuickSkuPanel from '@/pages/ordering/menu/components/catalog/QuickSkuPanel/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { GoodsDetail, PropertyChild } from '../../../models/goods.types'
import { useOrderingLocale as useI18n } from '../../../composables/use-locale'

/**
 * 列表快速加购的规格选择面板（纯展示）
 */

const props = defineProps<{
  goods: GoodsDetail
  buyNumber: number
  isActive: (propertyId: number, childId: number) => boolean
}>()

const emit = defineEmits<{
  close: []
  select: [propertyId: number, child: PropertyChild]
  minus: []
  plus: []
  submit: []
}>()

const { t } = useI18n()
const { currencySymbol, currencyUnit } = useOrderingCurrency()
const groups = computed(() => (props.goods.properties || []).map(g => ({
  id: g.id,
  name: g.name,
  choices: g.childsCurGoods.map(c => ({ id: c.id, name: c.name, active: props.isActive(g.id, c.id), priceText: typeof c.price === 'number' ? `${currencySymbol.value}${c.price}${currencyUnit.value}` : undefined })),
})))
function select(g: number, c: number) {
  const choice = props.goods.properties?.find(group => group.id === g)?.childsCurGoods.find(choice => choice.id === c)
  if (choice)
    emit('select', g, choice)
}
</script>

<template>
  <view>
    <view class="sku-mask" />
    <view class="sku-container">
      <image class="close" src="/static/images/icon/close.svg" @tap="emit('close')" />
      <goods-sku-selector :groups="groups" @select="select" />
      <view class="num">
        <view class="t">
          {{ t('goodsDetail.buyNumber') }}
        </view>
        <view class="num-box">
          <text class="a" @tap="emit('minus')">-</text>
          <text class="b">{{ buyNumber }}</text>
          <text class="a" @tap="emit('plus')">+</text>
        </view>
      </view>
    </view>
    <view class="sku-btn" @tap="emit('submit')">
      {{ t('goodsDetail.addCartBtn') }}
    </view>
  </view>
</template>

<style lang="scss" scoped>
.sku-mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  background: rgb(61 40 23 / 50%);
}

.sku-container {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0;
  z-index: 101;
  box-sizing: border-box;
  width: 100vw;
  padding: 40rpx 32rpx 24rpx;
  background: linear-gradient(180deg, #fff9f0 0%, #fff 100%);
  border-radius: 32rpx 32rpx 0 0;
  box-shadow: 0 -8rpx 32rpx rgb(139 111 71 / 15%);

  .close {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    box-sizing: border-box;
    width: 56rpx;
    height: 56rpx;
    padding: 12rpx;
    background: rgb(139 111 71 / 8%);
    border-radius: 50%;
    opacity: 0.8;
  }

  .num {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28rpx;

    .t {
      font-size: 30rpx;
      font-weight: 600;
      color: #3d2817;
    }

    .num-box {
      display: flex;
      align-items: center;
      overflow: hidden;
      background: #fffbf5;
      border: 2rpx solid #e5d4c1;
      border-radius: 16rpx;

      .a {
        width: 72rpx;
        height: 64rpx;
        font-size: 40rpx;
        line-height: 64rpx;
        color: #8b6f47;
        text-align: center;
      }

      .b {
        min-width: 80rpx;
        padding: 0 32rpx;
        font-size: 32rpx;
        font-weight: 600;
        line-height: 64rpx;
        color: #3d2817;
        text-align: center;
      }
    }
  }
}

.sku-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 101;
  width: 100vw;
  height: calc(100rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  font-size: 32rpx;
  font-weight: 600;
  line-height: 100rpx;
  color: #fff;
  text-align: center;
  background: var(--app-brand-primary, #8b4513);
  box-shadow: 0 -4rpx 16rpx rgb(139 69 19 / 12%);
}
</style>
