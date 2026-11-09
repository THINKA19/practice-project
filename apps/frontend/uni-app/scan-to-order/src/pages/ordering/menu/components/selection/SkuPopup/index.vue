<script setup lang="ts">
import GoodsSkuSelector from '@/components/goods-sku-selector/index.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/selection/SkuPopup/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import SkuPopup from '@/pages/ordering/menu/components/selection/SkuPopup/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { OptionGroupView } from '../../../models/types'
import { useOrderingLocale as useI18n } from '../../../composables/use-locale'

/**
 * 商品规格弹层：图片、名称、规格、加料、时段、详情、价格、数量、加购 / 一起拼
 */

defineProps<{
  show: boolean
  picture: string
  name: string
  content?: string
  propertyGroups: OptionGroupView[]
  additionGroups: OptionGroupView[]
  timeGroups: OptionGroupView[]
  price: number
  number: number
  min: number
  max: number
  /** 立即开团模式：按钮为“一起拼” */
  pingtuanMode: boolean
  submitting?: boolean
}>()

const emit = defineEmits<{
  'close': []
  'property': [groupId: number, choiceId: number]
  'addition': [groupId: number, choiceId: number]
  'time': [groupId: number, choiceId: number]
  'update:number': [value: number]
  'addCart': []
  'pingtuanBuy': []
}>()

const { currencySymbol, currencyUnit, currencyName } = useOrderingCurrency()

const { t } = useI18n()

function onNumber(v: number | string) {
  emit('update:number', Number(v))
}
</script>

<template>
  <wd-popup
    :model-value="show"
    position="bottom"
    closable
    :z-index="1000"
    custom-style="max-height: 80vh; border-radius: 32rpx 32rpx 0 0; overflow: hidden;"
    @close="emit('close')"
  >
    <scroll-view scroll-y class="sku-scroll">
      <image v-if="show && picture" class="photo" :src="picture" mode="aspectFill" />
      <view class="goods-name">
        {{ name }}
      </view>

      <view class="option-group">
        <goods-sku-selector :groups="propertyGroups" @select="(g, c) => emit('property', g, c)" />
        <goods-sku-selector :groups="additionGroups" @select="(g, c) => emit('addition', g, c)" />
        <goods-sku-selector :groups="timeGroups" @select="(g, c) => emit('time', g, c)" />
      </view>

      <view v-if="content" class="introduce">
        <view class="group-title">
          {{ t('goodsDetail.title') }}
        </view>
        <rich-text :nodes="content || ''" />
      </view>

      <view class="blank" />
      <view class="add-box">
        <view class="price">
          {{ currencySymbol }}{{ price }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
        </view>
        <wd-input-number :model-value="number" :min="min" :max="max" @update:model-value="onNumber" />
      </view>
      <view class="px-32rpx pb-40rpx">
        <wd-button v-if="pingtuanMode" block type="primary" size="large" @click="emit('pingtuanBuy')">
          {{ t('index.pingtuan') }}
        </wd-button>
        <wd-button v-else block type="primary" size="large" :loading="submitting" :disabled="submitting" @click="!submitting && emit('addCart')">
          {{ t('goodsDetail.addCartBtn') }}
        </wd-button>
      </view>
    </scroll-view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.sku-scroll {
  max-height: 80vh;
}

.photo {
  display: block;
  width: 320rpx;
  height: 320rpx;
  margin: 40rpx auto 0;
  border: 8rpx solid #fff;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
}

.goods-name {
  margin: 32rpx 40rpx 0;
  font-size: 36rpx;
  font-weight: 600;
  color: #2c2416;
  text-align: center;
}

.option-group,
.introduce {
  padding: 28rpx;
  margin: 40rpx 32rpx 0;
  background: linear-gradient(135deg, #faf8f5 0%, #fff 100%);
  border-radius: 20rpx;
}

.introduce {
  font-size: 28rpx;
  line-height: 1.8;
  color: #666;
}

.group-title {
  position: relative;
  padding-left: 20rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2416;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 6rpx;
    height: 28rpx;
    content: '';
    background: linear-gradient(180deg, #c09a6b 0%, #d4a574 100%);
    border-radius: 3rpx;
    transform: translateY(-50%);
  }
}

.blank {
  height: 16rpx;
  margin: 20rpx 0;
  background: linear-gradient(90deg, #f5f5f5 0%, #eee 50%, #f5f5f5 100%);
}

.add-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  margin: 40rpx 32rpx;
  background: linear-gradient(135deg, #faf8f5 0%, #fff 100%);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

  .price {
    font-size: 56rpx;
    font-weight: 700;
    color: #c93636;
  }
}
</style>
