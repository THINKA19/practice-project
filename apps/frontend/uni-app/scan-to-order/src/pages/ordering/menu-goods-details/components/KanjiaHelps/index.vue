<script setup lang="ts">
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】商品详情 / components/KanjiaHelps/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import KanjiaHelps from '@/pages/ordering/menu-goods-details/components/KanjiaHelps/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/**
 * 砍价记录（帮砍列表，纯展示）
 */
import type { KanjiaHelpLog } from '../../composables/use-kanjia'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'

defineProps<{
  helps: KanjiaHelpLog[]
}>()

const { formatPrice } = useOrderingCurrency()

const { t } = useI18n()
</script>

<template>
  <view class="card">
    <wd-cell-group :title="t('goodsDetail.kanjiaLogs')">
      <view v-for="(item, index) in helps" :key="index" class="kjlj">
        <image class="avatar" :src="item.avatarUrl" mode="aspectFill" />
        <view class="flex-1">
          <wd-cell
            :title="formatPrice(item.cutPrice ?? '')"
            :label="`${item.nick || ''} ${item.dateAdd || ''} ${t('goodsDetail.help2')}`"
            size="large"
          />
        </view>
      </view>
      <view class="h-64rpx" />
    </wd-cell-group>
  </view>
</template>

<style lang="scss" scoped>
.card {
  margin: 0 24rpx 24rpx;
  overflow: hidden;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(212 165 116 / 10%);
}

.kjlj {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background: #fff;
}

.avatar {
  flex-shrink: 0;
  width: 88rpx;
  height: 88rpx;
  margin-right: 16rpx;
  border-radius: 50%;
}
</style>
