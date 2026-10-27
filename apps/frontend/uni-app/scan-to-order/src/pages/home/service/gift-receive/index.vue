<script setup lang="ts">
/**
 * 领取好友赠送的礼品卡
 */
import { useI18n } from 'vue-i18n'
import { useGiftReceivePage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '领取礼品卡',
  },
})

const { t } = useI18n()
const vm = useGiftReceivePage()
const { user, cardUser, cardInfo } = vm
let shareQuery: { id?: string, shareToken?: string } = {}

onLoad((query) => {
  shareQuery = query as { id?: string, shareToken?: string }
})
onShow(() => vm.init(shareQuery))
</script>

<template>
  <view class="page-container">
    <view class="wave-decoration" />

    <view class="main-card">
      <view class="gift-icon">
        🎁
      </view>

      <view class="mb-32rpx flex items-center py-20rpx">
        <view class="relative mr-24rpx">
          <image class="sender-avatar" :src="user?.avatarUrl || '/static/images/who.png'" mode="aspectFill" />
        </view>
        <view class="flex-1">
          <view class="mb-8rpx text-36rpx text-#5c3317 font-bold">
            {{ user?.nick || t('card.receive.friend') }}
          </view>
          <view class="text-26rpx text-#a67c52 opacity-80">
            {{ t('card.send.sharePlaceholder') }}
          </view>
        </view>
      </view>

      <view v-if="cardInfo?.shareContent" class="blessing-card">
        <view class="blessing-icon">
          💌
        </view>
        <view class="blessing-text">
          {{ cardInfo?.shareContent }}
        </view>
        <view class="blessing-quote blessing-quote-left">
          "
        </view>
        <view class="blessing-quote blessing-quote-right">
          "
        </view>
      </view>

      <view class="relative my-48rpx">
        <view class="card-glow" />
        <view class="card-wrapper">
          <image class="h-full w-full" :src="cardInfo?.pic" mode="aspectFill" />
          <view class="card-shine" />
        </view>
        <view class="mt-36rpx text-center">
          <view class="mb-20rpx text-38rpx text-#5c3317 font-bold tracking-2rpx">
            {{ cardInfo?.name }}
          </view>
          <view class="card-divider" />
          <view class="mt-24rpx">
            <view v-if="cardUser?.type === 0" class="card-amount">
              <text class="amount-number">
                {{ cardUser?.amount }}
              </text>
              <text class="ml-8rpx text-28rpx text-#a67c52 font-500">
                {{ t('card.times') }}
              </text>
            </view>
            <view v-if="cardUser?.type === 1" class="card-amount">
              <text class="mr-4rpx text-32rpx text-#d4744f font-bold">
                ¥
              </text>
              <text class="amount-number">
                {{ cardUser?.amount }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view class="sparkle sparkle-1">
        ✨
      </view>
      <view class="sparkle sparkle-2">
        ✨
      </view>
      <view class="sparkle sparkle-3">
        ✨
      </view>

      <view class="relative mb-32rpx mt-56rpx">
        <wd-button round block size="large" custom-class="receive-button" @click="vm.submit()">
          {{ t('card.receive.action') }}
        </wd-button>
      </view>

      <view class="mt-16rpx flex items-center justify-center text-24rpx text-#a67c52 opacity-80">
        <text class="mr-8rpx text-32rpx">
          ☕
        </text>
        <text>领取后可在"我的"-"礼品卡"中查看</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  position: relative;
  min-height: 100vh;
  padding-bottom: 40rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f8d7da 100%);
}

.wave-decoration {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 0;
  height: 200rpx;
  background: linear-gradient(180deg, rgb(255 255 255 / 30%) 0%, transparent 100%);
  border-radius: 0 0 50% 50%;
}

.main-card {
  position: relative;
  z-index: 1;
  padding: 48rpx 32rpx 56rpx;
  margin: 40rpx 32rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, #fffbf7 100%);
  border-radius: 40rpx;
  box-shadow:
    0 20rpx 60rpx rgb(252 182 159 / 30%),
    0 8rpx 20rpx rgb(255 236 210 / 20%);
}

.gift-icon {
  position: absolute;
  top: -20rpx;
  right: 40rpx;
  z-index: 2;
  font-size: 80rpx;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-10rpx) rotate(5deg);
  }
}

.sender-avatar {
  width: 120rpx;
  height: 120rpx;
  border: 4rpx solid #fff;
  border-radius: 50%;
  box-shadow: 0 8rpx 20rpx rgb(252 182 159 / 30%);
}

.blessing-card {
  position: relative;
  padding: 32rpx 40rpx;
  margin: 32rpx 0 40rpx;
  background: linear-gradient(135deg, #fff9f3 0%, #ffe8d6 100%);
  border: 2rpx dashed rgb(166 124 82 / 30%);
  border-radius: 24rpx;
}

.blessing-icon {
  position: absolute;
  top: -16rpx;
  left: 24rpx;
  padding: 0 8rpx;
  font-size: 48rpx;
  background: #fff;
}

.blessing-text {
  position: relative;
  z-index: 1;
  font-size: 28rpx;
  font-style: italic;
  line-height: 48rpx;
  color: #5c3317;
  text-align: center;
}

.blessing-quote {
  position: absolute;
  font-family: Georgia, serif;
  font-size: 80rpx;
  font-weight: bold;
  color: rgb(252 182 159 / 20%);
}

.blessing-quote-left {
  top: 10rpx;
  left: 10rpx;
}

.blessing-quote-right {
  right: 10rpx;
  bottom: -20rpx;
}

.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400rpx;
  height: 400rpx;
  background: radial-gradient(circle, rgb(252 182 159 / 30%) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.card-wrapper {
  position: relative;
  width: 100%;
  height: 380rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 16rpx 40rpx rgb(92 51 23 / 15%);
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgb(255 255 255 / 30%) 50%, transparent 70%);
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.card-divider {
  width: 100rpx;
  height: 4rpx;
  margin: 20rpx auto;
  background: linear-gradient(90deg, transparent, #fcb69f, transparent);
  border-radius: 2rpx;
}

.card-amount {
  display: inline-flex;
  align-items: baseline;
  padding: 16rpx 40rpx;
  background: linear-gradient(135deg, #fff3e6 0%, #ffe8cc 100%);
  border-radius: 60rpx;
  box-shadow: 0 4rpx 16rpx rgb(252 182 159 / 20%);
}

.amount-number {
  font-size: 64rpx;
  font-weight: bold;
  line-height: 1;
  color: #d4744f;
}

.sparkle {
  position: absolute;
  font-size: 48rpx;
  opacity: 0.6;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle-1 {
  top: 15%;
  left: 10%;
}

.sparkle-2 {
  top: 25%;
  right: 15%;
  animation-delay: 0.7s;
}

.sparkle-3 {
  bottom: 35%;
  left: 15%;
  animation-delay: 1.4s;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
}

:deep(.receive-button) {
  font-size: 32rpx !important;
  font-weight: bold !important;
  letter-spacing: 4rpx !important;
  background: linear-gradient(135deg, #fcb69f 0%, #f8997f 100%) !important;
  border: none !important;
  box-shadow: 0 8rpx 24rpx rgb(248 153 127 / 40%) !important;
}
</style>
