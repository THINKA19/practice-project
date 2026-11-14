<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import GoodsTags from '../../GoodsTags.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/catalog/GoodsList/parts/GoodsCard.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import parts from '@/pages/ordering/menu/components/catalog/GoodsList/parts/GoodsCard.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { Goods, GoodsListAction, MiaoshaCountdown } from '@/pages/ordering/menu/index'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu/index'

/**
 * 商品卡片（原 van-card）：图片进详情、秒杀倒计时/砍价底价/卖点、价格、徽章、操作按钮
 */

const props = defineProps<{
  goods: Goods
  action: GoodsListAction
  countdown: MiaoshaCountdown | null
  /** 购物车中该商品数量 */
  badge: number
  adding?: boolean
}>()

const emit = defineEmits<{
  /** 打开规格/拼团弹层 */
  open: [goods: Goods]
  /** 快速加购 */
  add: [goods: Goods]
  /** 进入商品详情页 */
  detail: [goods: Goods]
}>()

const { countryCode } = useOrderingCurrency()

const { t } = useI18n()

const showOriginalPrice = computed(() => props.goods.originalPrice > 0 && props.goods.originalPrice > props.goods.minPrice)
</script>

<template>
  <view class="goods-card">
    <view class="thumb" @tap="emit('detail', goods)">
      <image class="h-full w-full" :src="goods.pic" mode="aspectFill" lazy-load />
      <view v-if="badge" class="tag">
        {{ badge }}
      </view>
    </view>
    <view class="info">
      <view class="title" role="button" @tap="emit('detail', goods)">
        {{ goods.name }}
      </view>
      <GoodsTags :tags="goods.tags" />
      <view class="desc">
        <wd-count-down
          v-if="goods.miaosha && countdown && countdown.startIn > 0"
          :time="countdown.startIn"
          format="HH时mm分ss秒"
          custom-class="count-down"
        />
        <wd-count-down
          v-else-if="goods.miaosha && countdown && countdown.startIn <= 0 && countdown.endIn > 0"
          :time="countdown.endIn"
          format="HH时mm分ss秒"
          custom-class="count-down"
        />
        <text v-else-if="goods.kanjia" class="desc-text">
          {{ t('goodsDetail.minPrice') }} <FgPrice :amount="goods.kanjiaPrice" :country-code="countryCode" />
        </text>
        <text v-else class="desc-text">
          {{ goods.characteristic }}
        </text>
      </view>
      <view class="bottom">
        <view class="goods-prices">
          <text class="price"><FgPrice :amount="goods.minPrice" :country-code="countryCode" /></text>
          <text v-if="showOriginalPrice" class="origin-price"><FgPrice :amount="goods.originalPrice" :country-code="countryCode" /></text>
        </view>
        <view class="goods-actions">
          <wd-button v-if="action === 'soldOut'" size="small" type="primary" round disabled custom-style="background: #e9e3dc; color: #6f6258; opacity: 1;">
            {{ t('goodsDetail.soldOut') }}
          </wd-button>
          <wd-button v-else-if="action === 'notStart'" size="small" type="primary" round disabled custom-style="background: #e9e3dc; color: #6f6258; opacity: 1;">
            {{ t('index.noStart') }}
          </wd-button>
          <wd-button v-else-if="action === 'ended'" size="small" type="primary" round disabled custom-style="background: #e9e3dc; color: #6f6258; opacity: 1;">
            {{ t('index.miaoshaEnd') }}
          </wd-button>
          <wd-button v-else-if="action === 'kanjia'" size="small" type="primary" round @click="emit('detail', goods)">
            {{ t('goodsDetail.kanjia') }}
          </wd-button>
          <wd-button v-else-if="action === 'pingtuan'" size="small" type="primary" round @click="emit('open', goods)">
            {{ t('index.pingtuan') }}
          </wd-button>
          <wd-button v-else-if="action === 'sku'" size="small" type="primary" round @click="emit('open', goods)">
            {{ t('index.selectSku') }}
          </wd-button>
          <view v-else class="add-btn" :class="{ 'is-adding': adding }" @tap="!adding && emit('add', goods)">
            <PageLoading inline indicator-only v-if="adding" size="28rpx" color="#fff" />
            <wd-icon v-else name="plus" size="32rpx" color="#fff" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.goods-card {
  display: flex;
  padding: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
  border: 1rpx solid #f5f5f5;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.thumb {
  position: relative;
  flex-shrink: 0;
  width: 144rpx;
  height: 144rpx;
  overflow: hidden;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  .tag {
    position: absolute;
    top: 0;
    left: 0;
    padding: 8rpx 16rpx;
    font-size: 22rpx;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
    border-radius: 0 0 16rpx;
  }
}

.info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  margin-left: 20rpx;
}

.title {
  overflow: hidden;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #2c2416;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.desc {
  margin-top: 8rpx;
  overflow: hidden;
  font-size: 24rpx;
  color: #999;
  text-overflow: ellipsis;
  white-space: nowrap;

  :deep(.count-down) {
    padding: 8rpx 0;
    color: #ed6a0c;
  }
}

.desc-text {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom {
  display: flex;
  flex-wrap: nowrap;
  gap: 12rpx;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.goods-prices {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.goods-actions {
  display: flex;
  flex-wrap: nowrap;
  flex-shrink: 0;
  align-self: center;
  max-width: 100%;
  margin-left: auto;

  :deep(.wd-button) {
    box-sizing: border-box;
    max-width: 100%;
    height: auto;
    min-height: 56rpx;
    padding: 8rpx 16rpx;
    font-size: 24rpx;
    line-height: 36rpx;
    white-space: nowrap;
  }
}

.price {
  white-space: nowrap;
  font-size: 40rpx;
  font-weight: 700;
  color: #c93636;
}

.origin-price {
  white-space: nowrap;
  font-size: 24rpx;
  color: #8b7355;
  text-decoration: line-through;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50rpx;
  height: 50rpx;
  background: var(--app-brand-primary, #8b4513);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(139, 69, 19, 0.16);

  &:active {
    transform: scale(0.94);
  }
}

.is-adding {
  pointer-events: none;
}
</style>
