<script setup lang="ts">
/**
 * 我的-资产卡片（纯展示）：优惠券数、余额、积分
 */
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  couponCount: number | string | null
  balance: number | string | null
  score: number | string | null
  status?: 'idle' | 'loading' | 'ready' | 'error' | 'unavailable'
}>(), { status: 'ready' })

const emit = defineEmits<{
  coupons: []
  balance: []
  score: []
}>()

const { t } = useI18n()

function display(value: number | string | null) {
  return value ?? '—'
}

function loading(value: number | string | null) {
  return value === null && (props.status === 'idle' || props.status === 'loading')
}
</script>

<template>
  <view class="assets-section">
    <view class="asset-card" @tap="emit('coupons')">
      <view class="asset-icon from-#FFE4B5 to-#FFD7A3 bg-gradient-to-br">
        <wd-icon name="gift" size="24px" color="#FF9800" />
      </view>
      <view class="asset-value" :class="{ 'asset-empty': couponCount === null }">
        <view v-if="loading(couponCount)" class="asset-skeleton" />
        <text v-else>{{ display(couponCount) }}</text>
      </view>
      <view class="text-24rpx text-#999">
        {{ t('coupons.title') }}
      </view>
    </view>
    <view class="asset-card" @tap="emit('balance')">
      <view class="asset-icon from-#FFF8DC to-#FFEAA7 bg-gradient-to-br">
        <wd-icon name="safe" size="24px" color="#E6A23C" />
      </view>
      <view class="asset-value" :class="{ 'asset-empty': balance === null }">
        <text v-if="balance !== null" class="mr-4rpx text-28rpx font-500">
          ¥
        </text>
        <view v-if="loading(balance)" class="asset-skeleton" />
        <text v-else>{{ display(balance) }}</text>
      </view>
      <view class="text-24rpx text-#999">
        {{ t('account.balance') }}
      </view>
    </view>
    <view class="asset-card" @tap="emit('score')">
      <view class="asset-icon from-#FFF8DC to-#FFEAA7 bg-gradient-to-br">
        <wd-icon name="star" size="24px" color="#FFD700" />
      </view>
      <view class="asset-value" :class="{ 'asset-empty': score === null }">
        <view v-if="loading(score)" class="asset-skeleton" />
        <text v-else>{{ display(score) }}</text>
      </view>
      <view class="text-24rpx text-#999">
        {{ t('account.score') }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.assets-section {
  display: flex;
  gap: 20rpx;
  justify-content: space-between;
  margin: 96rpx 32rpx 32rpx;
}

.asset-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 20rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(0 0 0 / 6%);
}

.asset-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 16rpx;
  border-radius: 50%;
}

.asset-value {
  display: flex;
  align-items: center;
  min-height: 56rpx;
  margin-bottom: 8rpx;
  font-size: 44rpx;
  font-weight: 600;
  color: #333;
}

.asset-empty {
  font-size: 24rpx;
  font-weight: 400;
}

.asset-skeleton {
  width: 80rpx;
  height: 28rpx;
  background: currentColor;
  border-radius: 8rpx;
  opacity: 0.12;
}
</style>
