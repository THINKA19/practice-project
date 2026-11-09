<script setup lang="ts">
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】结算与支付 / components/PayCardSelect/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import PayCardSelect from '@/pages/ordering/menu-pay/components/PayCardSelect/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/**
 * 结算页 - 会员卡选择（纯展示，选择通过 emit 通知）
 */
import type { MyCard } from '@/pages/home/service/gift-card'

defineProps<{
  cards: MyCard[]
  current: MyCard | null
}>()

const emit = defineEmits<{ select: [card: MyCard | null] }>()

const { currencySymbol, currencyUnit, currencyName } = useOrderingCurrency()

/** cardInfo.type：0 次卡 1 储值卡 */
function cardType(card: MyCard) {
  return Number((card.cardInfo as { type?: number } | undefined)?.type)
}
</script>

<template>
  <view class="card-select">
    <view class="mb-24rpx flex items-center">
      <wd-icon name="idcard" size="36rpx" color="#D4A574" />
      <text class="ml-12rpx text-32rpx text-#2C2C2C font-semibold">
        会员卡
      </text>
    </view>
    <view class="flex flex-col gap-16rpx">
      <!-- 不使用会员卡 -->
      <view class="card-item" :class="{ active: !current }" @tap="emit('select', null)">
        <view class="card-item-icon no-card">
          <wd-icon name="close" size="32rpx" color="#999" />
        </view>
        <view class="min-w-0 flex-1">
          <view class="card-item-name">
            不使用会员卡
          </view>
          <view class="card-item-desc">
            使用其他支付方式
          </view>
        </view>
      </view>
      <!-- 会员卡列表 -->
      <view
        v-for="item in cards"
        :key="item.id"
        class="card-item"
        :class="{ active: current && current.id === item.id }"
        @tap="emit('select', item)"
      >
        <view class="card-item-icon" :class="cardType(item) === 0 ? 'times-card-icon' : 'balance-card-icon'">
          <wd-icon :name="cardType(item) === 0 ? 'tag' : 'storage'" size="32rpx" color="#fff" />
        </view>
        <view class="min-w-0 flex-1">
          <view class="card-item-name">
            {{ item.cardInfo?.name }}
            <view class="card-type-tag" :class="cardType(item) === 0 ? 'times-tag' : 'balance-tag'">
              {{ cardType(item) === 0 ? '次卡' : '储值卡' }}
            </view>
          </view>
          <view class="card-item-desc">
            <text v-if="cardType(item) === 0">
              剩余 {{ item.amount }} 次
            </text>
            <text v-if="cardType(item) === 1">
              余额 {{ currencySymbol }}{{ item.amount }}{{ currencyUnit }}<text class="ml-4rpx text-20rpx font-normal">{{ currencyName }}</text>
            </text>
            <text class="ml-8rpx text-#999">
              | 至 {{ item.dateEnd }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card-select {
  padding: 32rpx;
  margin: 0 24rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgb(139 90 60 / 8%);
}

.card-item {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: #fafafa;
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #fff9f0 0%, #fff5eb 100%);
    border-color: #d4a574;
    box-shadow: 0 4rpx 16rpx rgb(212 165 116 / 20%);
  }
}

.card-item-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-right: 20rpx;
  border-radius: 50%;

  &.no-card {
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  }

  &.times-card-icon {
    background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  }

  &.balance-card-icon {
    background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
  }
}

.card-item-name {
  display: flex;
  gap: 8rpx;
  align-items: center;
  margin-bottom: 8rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2c2c;
}

.card-type-tag {
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  border-radius: 8rpx;

  &.times-tag {
    color: #2e7d32;
    background: rgb(67 160 71 / 15%);
  }

  &.balance-tag {
    color: #e65100;
    background: rgb(251 140 0 / 15%);
  }
}

.card-item-desc {
  font-size: 24rpx;
  line-height: 1.5;
  color: #666;
}
</style>
