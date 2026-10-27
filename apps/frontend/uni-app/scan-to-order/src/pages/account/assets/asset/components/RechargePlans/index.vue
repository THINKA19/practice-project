<script setup lang="ts">
/**
 * 充值套餐选择（纯展示）：满送规则 + 自定义金额
 */
import type { RechargeRule } from '../../models/types'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'RechargePlans' })

defineProps<{
  rules: RechargeRule[]
  selected: number
  /** 自定义金额对应的下标 */
  customIndex: number
}>()

const emit = defineEmits<{
  select: [idx: number]
}>()

const { t } = useI18n()
</script>

<template>
  <view class="recharge-plans">
    <view
      v-for="(item, index) in rules"
      :key="item.id"
      class="plan-card"
      :class="{ 'plan-active': selected === index }"
      @tap="emit('select', index)"
    >
      <view v-if="item.send > 0" class="plan-badge">
        送¥{{ item.send }}
      </view>
      <view class="flex items-baseline">
        <text class="text-26rpx font-600">
          ¥
        </text>
        <text class="text-44rpx font-700">
          {{ item.confine }}
        </text>
      </view>
      <view class="mt-4rpx text-22rpx opacity-70">
        {{ t('wallet.confine') }}
      </view>
      <view v-if="selected === index" class="plan-check">
        <wd-icon name="check" color="#fff" size="12px" />
      </view>
    </view>

    <view class="plan-card" :class="{ 'plan-active': selected === customIndex }" @tap="emit('select', customIndex)">
      <view class="text-40rpx">
        ✏️
      </view>
      <view class="mt-8rpx text-26rpx">
        {{ t('wallet.customAmount') }}
      </view>
      <view v-if="selected === customIndex" class="plan-check">
        <wd-icon name="check" color="#fff" size="12px" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.recharge-plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 160rpx;
  overflow: hidden;
  color: #8b7355;
  background: #fffaf5;
  border: 2rpx solid #f0e0d0;
  border-radius: 20rpx;
}

.plan-active {
  color: #fff;
  background: linear-gradient(135deg, #d4a373 0%, #a67c52 100%);
  border-color: #a67c52;
  box-shadow: 0 8rpx 20rpx rgb(166 124 82 / 30%);
}

.plan-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  color: #fff;
  background: #ff6b6b;
  border-radius: 0 20rpx 0 16rpx;
}

.plan-check {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 36rpx;
  background: rgb(0 0 0 / 15%);
  border-radius: 16rpx 0 0;
}
</style>
