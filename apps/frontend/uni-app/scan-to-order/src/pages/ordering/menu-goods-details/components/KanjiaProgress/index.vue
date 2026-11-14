<script setup lang="ts">
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】商品详情 / components/KanjiaProgress/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import KanjiaProgress from '@/pages/ordering/menu-goods-details/components/KanjiaProgress/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/**
 * 砍价设置 + 当前砍价进度（纯展示）
 */
import type { KanjiaProgressView, KanjiaSetView } from '../../composables/use-kanjia'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'

defineProps<{
  kanjiaSet: KanjiaSetView | null
  progress: KanjiaProgressView | null
  percentage: number
}>()

const { countryCode } = useOrderingCurrency()

const { t } = useI18n()
</script>

<template>
  <view>
    <view v-if="kanjiaSet" class="card">
      <wd-cell-group :title="t('goodsDetail.kanJiaSetting')">
        <wd-cell :title="t('goodsDetail.limit')" :value="kanjiaSet.number ?? ''" />
        <wd-cell :title="t('goodsDetail.saledNum')" :value="kanjiaSet.numberBuy ?? ''" />
        <wd-cell :title="t('goodsDetail.originalPrice')">
          <FgPrice :amount="kanjiaSet.originalPrice" :country-code="countryCode" show-currency-name />
        </wd-cell>
        <wd-cell :title="t('goodsDetail.minPrice')">
          <FgPrice :amount="kanjiaSet.minPrice" :country-code="countryCode" show-currency-name />
        </wd-cell>
        <wd-cell :title="t('goodsDetail.end')" :value="kanjiaSet.dateEnd || ''" />
      </wd-cell-group>
    </view>
    <view v-if="progress" class="card progress">
      <view class="name">
        {{ t('goodsDetail.help') }}
        <text class="nick">{{ progress.joiner?.nick }}</text>
        {{ t('goodsDetail.kanjia') }}！
      </view>
      <view class="bar">
        <wd-progress :percentage="percentage" color="#1aad19" hide-text />
        <view class="pivot">
          <FgPrice :amount="progress.kanjiaInfo.curPrice" :country-code="countryCode" show-currency-name />
        </view>
      </view>
      <view class="share">
        <button class="share-btn" type="primary" open-type="share">
          {{ t('goodsDetail.inviteKanJiaFriend') }}
        </button>
      </view>
      <wd-cell :title="t('goodsDetail.helpPerson')" :value="progress.kanjiaInfo.helpNumber" />
      <wd-cell :title="t('goodsDetail.status')" :value="progress.kanjiaInfo.statusStr || ''" />
      <wd-cell :title="t('goodsDetail.joinTime')" :value="progress.kanjiaInfo.dateAdd || ''" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card {
  margin: 0 24rpx 24rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(212 165 116 / 10%);
}

.progress {
  padding: 32rpx;

  .name {
    padding-bottom: 24rpx;
    font-size: 32rpx;
    color: #333;
    text-align: center;
  }

  .nick {
    font-weight: bold;
    color: red;
  }

  .bar {
    display: flex;
    gap: 16rpx;
    align-items: center;
    margin: 32rpx 0;

    :deep(.wd-progress) {
      flex: 1;
    }
  }

  .pivot {
    padding: 4rpx 12rpx;
    font-size: 24rpx;
    color: #fff;
    background: #1aad19;
    border-radius: 20rpx;
  }

  .share {
    padding: 0 30rpx 24rpx;
  }

  .share-btn {
    background: linear-gradient(135deg, #d4a574 0%, #c9935e 100%);
    border-radius: 40rpx;
  }
}
</style>
