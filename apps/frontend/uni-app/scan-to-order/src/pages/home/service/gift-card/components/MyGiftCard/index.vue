<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
/**
 * 展示持卡状态，并提供赠送、撤回和查看详情入口。
 */
import type { MyCard } from '../../models/types'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { myCardState } from '../../domain/card.rules'

defineOptions({ name: 'MyGiftCard' })

const props = defineProps<{ card: MyCard, cancelling?: boolean }>()

const emit = defineEmits<{
  send: []
  shareAgain: []
  cancelShare: []
  details: []
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
          待好友领取
        </view>
      </view>
      <view class="p-32rpx">
        <view class="mb-24rpx text-32rpx text-#333 font-600">
          {{ card.cardInfo?.name }}
        </view>
        <view v-if="state === 'canShare'" class="card-actions">
          <button class="action-btn primary" hover-class="action-pressed" @tap="emit('send')">
            {{ t('card.giftToFriend') }}
          </button>
        </view>
        <view v-else-if="state === 'sharing'" class="gift-share-actions">
          <button class="action-btn primary" hover-class="action-pressed" :disabled="cancelling" @tap="emit('shareAgain')">
            <!-- #ifdef H5 -->
            复制领取链接
            <!-- #endif -->
            <!-- #ifndef H5 -->
            再次分享
            <!-- #endif -->
          </button>
          <button class="action-btn secondary" hover-class="action-pressed" :disabled="cancelling" @tap="emit('cancelShare')">
            <PageLoading v-if="cancelling" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
            {{ cancelling ? '撤回中…' : '撤回赠送' }}
          </button>
        </view>
        <view v-if="state === 'expired' || state === 'empty' || state === 'active'" class="mb-16rpx text-26rpx text-#777">
          {{ state === 'expired' ? '已过期' : state === 'empty' ? '余额或次数已用完' : card.fromUid || card.fromUser ? '已领取' : '已激活' }}
        </view>
        <view class="card-actions" :class="{ 'mt-16rpx': state !== 'active' }">
          <button class="action-btn outline" hover-class="action-pressed" @tap="emit('details')">
            查看详情
          </button>
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
  top: 24rpx;
  right: 24rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #654226;
  background: #fff4df;
  border-radius: 24rpx;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.gift-share-actions {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 16rpx;
}

.action-btn {
  width: 100%;
  min-height: 88rpx;
  margin: 0;
  padding: 16rpx 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  border: 2rpx solid transparent;
  border-radius: 20rpx;

  &.primary {
    color: #fff;
    background: #754e37;
  }

  &.secondary {
    color: #923d31;
    background: #fff7f4;
    border-color: #e8c4bc;
  }

  &.outline {
    color: #654735;
    background: #fff;
    border-color: #e6d7ca;
  }

  &[disabled] {
    opacity: 0.55;
  }

  &.action-pressed:not([disabled]) {
    filter: brightness(0.94);
  }

  &::after {
    border: 0;
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
