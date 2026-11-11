<script setup lang="ts">
defineOptions({ name: 'CouponCard' })
/**
 * 优惠券卡片（纯展示）：可领 / 已领(可用) / 失效 三种样式
 */
withDefaults(defineProps<{
  variant: 'fetch' | 'usable' | 'invalid'
  /** 0 满减（元） 1 折扣 */
  moneyType?: number
  amount: number | string
  threshold: number | string
  name: string
  badge: string
  desc: string
  actionText: string
  disabled?: boolean
}>(), {
  moneyType: 0,
  disabled: false,
})

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <view class="coupon-card" :class="`coupon-card--${variant}`">
    <view class="coupon-card-inner">
      <view class="coupon-left">
        <view class="z-2 flex flex-col items-center justify-center">
          <view class="coupon-amount">
            <text v-if="moneyType === 0" class="currency">
              ¥
            </text>
            <text class="amount-num">
              {{ amount }}
            </text>
            <text v-if="moneyType === 1" class="percent">
              折
            </text>
          </view>
          <view class="coupon-condition">
            满{{ threshold }}可用
          </view>
        </view>
        <view class="circle circle-top" />
        <view class="circle circle-bottom" />
      </view>
      <view class="coupon-right">
        <view class="flex-1">
          <view class="coupon-badge">
            {{ badge }}
          </view>
          <view class="coupon-name">
            {{ name }}
          </view>
          <view class="coupon-desc">
            {{ desc }}
          </view>
        </view>
        <view class="mt-20rpx flex justify-end">
          <view class="action-btn" :class="{ 'action-btn--disabled': disabled }" :aria-disabled="disabled || variant === 'invalid'" @tap="!disabled && variant !== 'invalid' && emit('action')">
            {{ actionText }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.coupon-card {
  position: relative;
  margin-bottom: 32rpx;
}

.coupon-card-inner {
  position: relative;
  display: flex;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, #fffbf7 100%);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgb(139 111 71 / 12%);
}

.coupon-left {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 240rpx;
  padding: 40rpx 0;
  background: linear-gradient(135deg, #d4a574 0%, #b8935f 100%);

  &::after {
    position: absolute;
    top: 24rpx;
    right: 0;
    bottom: 24rpx;
    width: 2rpx;
    content: '';
    background-image: linear-gradient(to bottom, rgb(255 255 255 / 30%) 50%, transparent 50%);
    background-size: 2rpx 12rpx;
  }
}

.coupon-amount {
  display: flex;
  align-items: baseline;
  margin-bottom: 12rpx;
  color: #fff;
}

.currency,
.percent {
  font-size: 36rpx;
  font-weight: 600;
}

.amount-num {
  font-family: DIN, Helvetica, Arial, sans-serif;
  font-size: 72rpx;
  font-weight: bold;
  line-height: 1;
}

.coupon-condition {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: rgb(255 255 255 / 90%);
  text-align: center;
  background: rgb(255 255 255 / 20%);
  border-radius: 20rpx;
}

.circle {
  position: absolute;
  right: -12rpx;
  z-index: 1;
  width: 24rpx;
  height: 24rpx;
  background: #fff8f0;
  border-radius: 50%;
}

.circle-top {
  top: -12rpx;
}

.circle-bottom {
  bottom: -12rpx;
}

.coupon-right {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 36rpx 32rpx;
}

.coupon-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  margin-bottom: 16rpx;
  font-size: 20rpx;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #f4a460 0%, #d2691e 100%);
  border-radius: 20rpx;
}

.coupon-name {
  margin-bottom: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #333;
}

.coupon-desc {
  font-size: 24rpx;
  line-height: 1.5;
  color: #999;
}

.action-btn {
  padding: 16rpx 40rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #d4a574 0%, #b8935f 100%);
  border-radius: 40rpx;
  box-shadow: 0 4rpx 12rpx rgb(180 147 95 / 30%);
}

.action-btn--disabled {
  color: #888;
  background: #e5e5e5;
  box-shadow: none;
}

.coupon-card--usable {
  .coupon-card-inner {
    background: linear-gradient(135deg, #fffbf7 0%, #fff5e8 100%);
    border: 2rpx solid rgb(255 140 66 / 20%);
  }

  .coupon-left {
    background: linear-gradient(135deg, #f4a460 0%, #d2691e 100%);
  }

  .coupon-badge,
  .action-btn {
    background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%);
  }
}

.coupon-card--invalid {
  .coupon-card-inner {
    background: #f5f5f5;
    opacity: 0.7;
  }

  .coupon-left {
    background: linear-gradient(135deg, #ccc 0%, #999 100%);
  }

  .coupon-amount {
    opacity: 0.6;
  }

  .coupon-badge {
    background: #ccc;
  }

  .coupon-name,
  .coupon-desc,
  .coupon-condition {
    color: #ccc !important;
  }

  .action-btn {
    color: #ccc;
    background: #eee;
    box-shadow: none;
  }
}
</style>
