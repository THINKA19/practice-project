<script setup lang="ts">
/**
 * 兑换礼品卡：兑换码 + 同意协议
 */
import { useI18n } from 'vue-i18n'
import { useCardExchangePage } from './composables/use-exchange-page'

definePage({
  style: {
    navigationBarTitleText: '礼品卡兑换',
  },
})

const { t } = useI18n()
const vm = useCardExchangePage()
const { number, agree } = vm

onLoad(() => {
  vm.init()
})
</script>

<template>
  <view class="exchange-container">
    <view class="header-section">
      <view class="decoration-circle circle-1" />
      <view class="decoration-circle circle-2" />
      <view class="relative z-1 mb-32rpx">
        <view class="icon-wrapper">
          🎁
        </view>
      </view>
      <view class="title">
        {{ t('card.exchange.title') }}
      </view>
      <view class="relative z-1 text-28rpx text-#9B8B7A">
        请输入您的礼品卡兑换码
      </view>
    </view>

    <view class="content-card">
      <view class="mb-40rpx">
        <view class="mb-20rpx flex items-center text-30rpx text-#5D4E3C font-600">
          <view class="mr-12rpx text-32rpx">
            🔖
          </view>
          <text>兑换码</text>
        </view>
        <view class="input-wrapper">
          <wd-input
            v-model="number"
            :placeholder="t('card.exchange.codePlaceholder')"
            placeholder-style="color: #C8B8A8"
            custom-class="exchange-input"
          />
        </view>
        <view class="mt-12rpx pl-8rpx text-24rpx text-#B5A393">
          请输入完整的礼品卡兑换码
        </view>
      </view>

      <view class="my-40rpx py-24rpx">
        <view class="flex flex-wrap items-center justify-center" @tap="vm.toggleAgree()">
          <view class="checkbox" :class="{ checked: agree }">
            <wd-icon v-if="agree" name="check" size="28rpx" color="#fff" />
          </view>
          <text class="mr-8rpx text-26rpx text-#7A6B5A">
            我已阅读并同意
          </text>
          <text class="agreement-link" @tap.stop="vm.xieyi()">
            {{ t('card.exchange.agreement') }}
          </text>
        </view>
      </view>

      <view class="my-48rpx">
        <view class="submit-btn" @tap="vm.submit()">
          <text>立即兑换</text>
          <view class="btn-shine" />
        </view>
      </view>

      <view class="tips-section">
        <view class="mb-20rpx text-28rpx text-#5D4E3C font-600">
          💡 温馨提示
        </view>
        <view class="tips-item">
          • 每个兑换码仅可使用一次
        </view>
        <view class="tips-item">
          • 兑换成功后将自动存入您的账户
        </view>
        <view class="tips-item">
          • 如有疑问请联系客服咨询
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.exchange-container {
  min-height: 100vh;
  padding: 40rpx 32rpx;
  background: linear-gradient(180deg, #f5ede4 0%, #fdfbf7 100%);
}

.header-section {
  position: relative;
  padding: 60rpx 0 80rpx;
  overflow: hidden;
  text-align: center;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  top: -100rpx;
  left: -80rpx;
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #d4a574 0%, #c89666 100%);
}

.circle-2 {
  top: 20rpx;
  right: -50rpx;
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(135deg, #e8c4a0 0%, #d4a574 100%);
}

.icon-wrapper {
  display: inline-block;
  width: 120rpx;
  height: 120rpx;
  font-size: 64rpx;
  line-height: 120rpx;
  background: linear-gradient(135deg, #fff5eb 0%, #ffe8d6 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 32rpx rgb(212 165 116 / 20%);
}

.title {
  position: relative;
  z-index: 1;
  margin-bottom: 16rpx;
  font-size: 48rpx;
  font-weight: 700;
  color: #5d4e3c;
  letter-spacing: 2rpx;
}

.content-card {
  position: relative;
  padding: 48rpx 40rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 8rpx 40rpx rgb(93 78 60 / 8%);

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 6rpx;
    content: '';
    background: linear-gradient(90deg, #d4a574 0%, #c89666 50%, #d4a574 100%);
  }
}

.input-wrapper {
  margin-bottom: 16rpx;
  overflow: hidden;
  border-radius: 16rpx;
}

:deep(.exchange-input) {
  padding: 28rpx 32rpx !important;
  font-size: 32rpx;
  background: #f9f6f2 !important;
  border-radius: 16rpx;
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  margin-right: 12rpx;
  background: #fff;
  border: 2rpx solid #d4a574;
  border-radius: 8rpx;

  &.checked {
    background: linear-gradient(135deg, #d4a574 0%, #c89666 100%);
    border-color: #c89666;
  }
}

.agreement-link {
  font-size: 26rpx;
  font-weight: 500;
  color: #d4a574;
  text-decoration: underline;
}

.submit-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  overflow: hidden;
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 4rpx;
  background: linear-gradient(135deg, #d4a574 0%, #c89666 100%);
  border-radius: 48rpx;
  box-shadow: 0 12rpx 32rpx rgb(212 165 116 / 35%);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 30%), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }

  50%,
  100% {
    left: 150%;
  }
}

.tips-section {
  padding: 32rpx;
  background: linear-gradient(135deg, #fff9f3 0%, #fff5eb 100%);
  border: 2rpx solid #f5e8db;
  border-radius: 20rpx;
}

.tips-item {
  padding-left: 8rpx;
  font-size: 26rpx;
  line-height: 44rpx;
  color: #8a7866;
}
</style>
