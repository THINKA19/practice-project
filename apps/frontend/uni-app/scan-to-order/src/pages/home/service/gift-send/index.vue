<script setup lang="ts">
/**
 * 赠送礼品卡：卡片展示 + 赠送留言 + 分享给好友
 */
import { useI18n } from 'vue-i18n'
import { useGiftSendPage } from './composables/use-page'

definePage({
  style: {
    navigationBarTitleText: '赠送礼品卡',
  },
})
const { t } = useI18n()
const vm = useGiftSendPage()
const { cardUser, remark, shareToken, preparing } = vm
let cardId = ''
onLoad((query) => {
  // 与原实现一致：只允许通过页面按钮分享
  // #ifdef MP-WEIXIN

  uni.hideShareMenu({ hideShareItems: ['shareAppMessage', 'shareTimeline'] })
  // #endif

  cardId = String(query?.cardId || '')
})
onShow(() => {
  void vm.init({ cardId })
})
onShareAppMessage(() => vm.shareAppMessage())
</script>

<template>
  <view class="page-container">
    <view class="top-decoration">
      <view class="deco-circle deco-circle-1" />
      <view class="deco-circle deco-circle-2" />
    </view>

    <view class="relative z-1">
      <view class="mb-48rpx text-center">
        <view class="mb-16rpx text-80rpx">
          🎁
        </view>
        <view class="mb-12rpx text-48rpx text-#5D4037 font-700 tracking-2rpx">
          赠送礼品卡
        </view>
        <view class="text-26rpx text-#8D6E63">
          传递心意，分享美好时光
        </view>
      </view>

      <view class="gift-card">
        <view class="card-shine" />
        <view class="relative z-3 p-40rpx">
          <view class="card-image-wrapper">
            <image class="block h-full w-full" :src="cardUser?.cardInfo?.pic" mode="aspectFill" />
          </view>
          <view class="text-center">
            <view class="mb-24rpx text-40rpx text-#4E342E font-700 leading-normal">
              {{ cardUser?.cardInfo?.name }}
            </view>
            <view class="flex items-baseline justify-center">
              <view v-if="cardUser?.type === 0" class="value-container">
                <text class="value-number">
                  {{ cardUser?.amount }}
                </text>
                <text class="value-unit">
                  {{ t('card.times') }}
                </text>
              </view>
              <view v-if="cardUser?.type === 1" class="value-container">
                <text class="value-symbol">
                  ¥
                </text>
                <text class="value-number">
                  {{ cardUser?.amount }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="message-section">
        <view class="mb-20rpx flex items-center">
          <view class="mr-12rpx text-36rpx">
            💌
          </view>
          <view class="text-30rpx text-#5D4037 font-600">
            赠送留言
          </view>
        </view>
        <view class="message-input-wrapper">
          <wd-textarea
            v-model="remark"
            auto-height
            :placeholder="t('card.send.sharePlaceholder')"
            custom-textarea-class="min-h-160rpx"
          />
        </view>
      </view>

      <wd-button v-if="!shareToken" round block :disabled="!cardUser || preparing" :loading="preparing" @click="vm.prepare()">
        生成赠送链接
      </wd-button>
      <!-- #ifdef MP-WEIXIN -->
      <wd-button v-if="shareToken" round block size="large" open-type="share" custom-class="share-button">
        <text class="mr-12rpx text-36rpx">
          ✨
        </text>
        <text>{{ t('card.giftToFriend') }}</text>
      </wd-button>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <view v-if="shareToken">
        请在微信小程序中分享礼品卡
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  position: relative;
  min-height: 100vh;
  padding: 40rpx 32rpx 60rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #f5e6d3 0%, #e8d4c0 50%, #dcc5b0 100%);
}

.top-decoration {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 0;
  height: 400rpx;
  overflow: hidden;
  pointer-events: none;
}

.deco-circle {
  position: absolute;
  background: linear-gradient(135deg, #8b6f47 0%, #a0826d 100%);
  border-radius: 50%;
  opacity: 0.1;
}

.deco-circle-1 {
  top: -200rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
}

.deco-circle-2 {
  top: 100rpx;
  left: -150rpx;
  width: 300rpx;
  height: 300rpx;
}

.gift-card {
  position: relative;
  margin-bottom: 40rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #fff 0%, #fff8f0 100%);
  border-radius: 32rpx;
  box-shadow:
    0 20rpx 60rpx rgb(141 110 99 / 15%),
    0 8rpx 20rpx rgb(141 110 99 / 10%);
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  z-index: 2;
  width: 200%;
  height: 200%;
  pointer-events: none;
  background: linear-gradient(45deg, transparent 30%, rgb(255 255 255 / 30%) 50%, transparent 70%);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 380rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgb(141 110 99 / 12%);
}

.value-container {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  padding: 16rpx 40rpx;
  background-color: rgb(139 111 71 / 8%);
  border-radius: 60rpx;
}

.value-symbol {
  margin-right: 8rpx;
  font-size: 40rpx;
  font-weight: 600;
  color: #8b6f47;
}

.value-number {
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
  color: #8b6f47;
}

.value-unit {
  margin-left: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #a0826d;
}

.message-section {
  padding: 32rpx;
  margin-bottom: 40rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(141 110 99 / 8%);
}

.message-input-wrapper {
  padding: 8rpx;
  overflow: hidden;
  background: #fff8f0;
  border: 2rpx solid #f5e6d3;
  border-radius: 16rpx;
}

:deep(.share-button) {
  height: 96rpx !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #8b6f47 0%, #a0826d 100%) !important;
  border: none !important;
  box-shadow: 0 12rpx 40rpx rgb(139 111 71 / 30%) !important;
}
</style>
