<script setup lang="ts">
/**
 * 我的礼品卡（纯展示）：可赠送 / 赠送中(可取消) / 已激活(消费明细、赠送人)
 */
import type { MyCard } from '../../models/types'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { myCardState } from '../../domain/card.rules'

defineOptions({ name: 'MyGiftCard' })

const props = defineProps<{ card: MyCard }>()

const emit = defineEmits<{
  send: []
  cancelShare: []
  logs: []
}>()

const { t } = useI18n()
const state = computed(() => myCardState(props.card))
const imageFailed = ref(false)
watch(() => props.card.cardInfo?.pic, () => {
  imageFailed.value = false
})
</script>

<template>
  <view class="my-gift-card">
    <view class="my-card-wrapper">
      <view class="my-card-image-box">
        <image class="h-full w-full" :src="!imageFailed && card.cardInfo?.pic ? card.cardInfo.pic : '/static/images/gift-card/classic.png'" mode="aspectFill" @error="imageFailed = true" />
        <view class="card-overlay">
          <view class="flex items-end justify-between">
            <view v-if="card.dateEnd" class="expire-date">
              {{ t('card.validUntil') }}: {{ card.dateEnd }}
            </view>
            <view class="card-amount">
              <text v-if="card.type === 0">
                {{ card.amount }}
              </text>
              <text v-if="card.type === 1">
                ¥{{ card.amount }}
              </text>
              <text v-if="card.type === 0" class="unit">
                {{ t('card.times') }}
              </text>
            </view>
          </view>
        </view>
        <view v-if="state === 'sharing'" class="card-status-tag">
          {{ t('card.giftSending') }}
        </view>
      </view>
      <view class="p-32rpx">
        <view class="mb-24rpx text-32rpx text-#333 font-600">
          {{ card.cardInfo?.name }}
        </view>
        <view v-if="state === 'canShare'" class="card-actions">
          <view class="action-btn primary" @tap="emit('send')">
            {{ t('card.giftToFriend') }}
          </view>
        </view>
        <view v-else-if="state === 'sharing'" class="card-actions">
          <view class="action-btn danger" @tap="emit('cancelShare')">
            {{ t('card.cancelShare') }}
          </view>
        </view>
        <view v-else class="card-actions">
          <view class="action-btn outline" @tap="emit('logs')">
            {{ t('card.usageLogs') }}
          </view>
          <view v-if="card.fromUser" class="gift-from">
            <image class="from-avatar" :src="card.fromUser.avatarUrl || '/static/images/who.png'" mode="aspectFill" />
            <text class="text-26rpx text-#666">
              {{ card.fromUser.nick || '微信用户' }}送出
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.my-gift-card {
  margin-bottom: 32rpx;
}

.my-card-wrapper {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(160 130 109 / 12%);
}

.my-card-image-box {
  position: relative;
  width: 100%;
  height: 380rpx;
  overflow: hidden;
}

.card-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 40rpx 32rpx 24rpx;
  background: linear-gradient(to top, rgb(0 0 0 / 75%) 0%, rgb(0 0 0 / 40%) 50%, transparent 100%);
}

.expire-date {
  font-size: 22rpx;
  line-height: 1.5;
  color: rgb(255 255 255 / 90%);
}

.card-amount {
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgb(0 0 0 / 30%);
}

.unit {
  margin-left: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.card-status-tag {
  position: absolute;
  top: 32rpx;
  right: 0;
  padding: 12rpx 28rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, rgb(255 107 107 / 95%) 0%, rgb(255 66 66 / 95%) 100%);
  border-radius: 32rpx 0 0 32rpx;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-btn {
  padding: 20rpx 0;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  border-radius: 48rpx;

  &.primary {
    color: #fff;
    background: linear-gradient(135deg, #a0826d 0%, #8b6f47 100%);
    box-shadow: 0 6rpx 20rpx rgb(160 130 109 / 30%);
  }

  &.danger {
    color: #fff;
    background: linear-gradient(135deg, #ff9aa2 0%, #ff6b6b 100%);
    box-shadow: 0 6rpx 20rpx rgb(255 107 107 / 30%);
  }

  &.outline {
    color: #a0826d;
    background: #fff;
    border: 2rpx solid #a0826d;
  }
}

.gift-from {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-top: 16rpx;
  background: linear-gradient(135deg, #fff8f0 0%, #fff0f5 100%);
  border: 1rpx solid rgb(160 130 109 / 10%);
  border-radius: 16rpx;
}

.from-avatar {
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
  border: 2rpx solid #fff;
  border-radius: 50%;
}
</style>
