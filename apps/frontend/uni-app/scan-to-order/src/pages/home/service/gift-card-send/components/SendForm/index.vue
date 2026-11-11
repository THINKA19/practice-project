<!--
============================================================================
【文件概述】
礼品卡赠送领域展示层；接收响应式状态并委托控制器处理交互，不直接调用接口。

【方法与导出清单】
SendForm：默认组件；vm 为 ReturnType<typeof useGiftSendPage>，由同领域页面创建。

【综合使用示例】
```typescript
import SendForm from './components/SendForm/index.vue'
import { useGiftSendPage } from './composables/use-page'
const vm = useGiftSendPage() // 在父页面 setup 中调用
// 页面模板：<SendForm :vm="vm" />
```
============================================================================
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { myCardState } from '../../../gift-card'
// #ifdef H5
import { computed, ref } from 'vue'
import { giftReceiveUrl } from '../../../routes'
import { toast } from '@/utils/project/interaction'
// #endif
import type { useGiftSendPage } from '../../composables/use-page'

const { vm } = defineProps<{ vm: ReturnType<typeof useGiftSendPage> }>()
const { cardUser, remark, shareToken, preparing, loading, failed } = vm
const { t } = useI18n()

// #ifdef H5
const receiveUrl = computed(() => shareToken.value
  ? giftReceiveUrl(vm.shareAppMessage().path, window.location.href, import.meta.env.VITE_APP_ROUTER_MODE, import.meta.env.VITE_APP_PUBLIC_BASE)
  : '')
const copiedUrl = ref('')

function copyReceiveUrl() {
  const url = receiveUrl.value
  if (!url)
    return
  uni.setClipboardData({
    data: url,
    showToast: false,
    success: () => {
      if (url === receiveUrl.value)
        copiedUrl.value = url
    },
    fail: () => toast('复制失败，请手动选中链接复制'),
  })
}
// #endif
</script>

<template>
  <view class="page-container">
    <view class="top-decoration">
      <view class="deco-circle deco-circle-1" />
      <view class="deco-circle deco-circle-2" />
    </view>

    <view class="relative z-1 w-full">
      <view v-if="loading" class="py-8 text-center">
        正在加载礼品卡…
      </view>
      <view v-else-if="!cardUser" class="py-8 text-center">
        {{ failed ? '加载失败，请重试' : '未找到可赠送的礼品卡，请返回卡包选择' }}
        <button v-if="failed" @tap="vm.retry()">
          重新加载
        </button>
      </view>
      <view v-else class="gift-card">
        <view class="relative z-3 p-40rpx">
          <view class="card-image-wrapper">
            <image class="block h-full w-full" :src="cardUser?.cardInfo?.pic || '/static/images/gift-card/classic.png'" mode="aspectFill" />
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

      <view v-if="cardUser && !shareToken && myCardState(cardUser) === 'canShare'" class="message-section">
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
            :disabled="preparing || !!shareToken"
            auto-height
            :placeholder="t('card.send.sharePlaceholder')"
            custom-textarea-class="min-h-160rpx"
          />
        </view>
      </view>

      <!-- #ifdef H5 || MP-WEIXIN -->
      <wd-button v-if="cardUser && !shareToken && myCardState(cardUser) === 'canShare'" round block :disabled="preparing" :loading="preparing" @click="vm.prepare()">
        确认赠送
      </wd-button>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <wd-button v-if="shareToken" round block size="large" open-type="share" custom-class="share-button">
        <text>{{ t('card.giftToFriend') }}</text>
      </wd-button>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <view v-if="receiveUrl" class="message-section">
        <view class="mb-12rpx text-32rpx text-#4f3528 font-600">
          领取链接
        </view>
        <view class="mb-20rpx text-26rpx text-#6f594c leading-relaxed" role="status">
          {{ copiedUrl === receiveUrl ? '链接已复制，可以发给好友了。' : '把链接发给好友，好友登录后可领取。' }}
        </view>
        <text selectable class="receive-url">{{ receiveUrl }}</text>
        <wd-button class="mt-24rpx" custom-class="share-button" block @click="copyReceiveUrl()">
          {{ copiedUrl === receiveUrl ? '再次复制' : '复制领取链接' }}
        </wd-button>
      </view>
      <!-- #endif -->
      <view v-if="shareToken" class="py-24rpx text-center">
        撤回赠送后，已发出的领取链接会失效。
      </view>
      <view v-else-if="cardUser && myCardState(cardUser) !== 'canShare'" class="py-24rpx text-center">
        这张礼品卡当前不可赠送。
      </view>
      <!-- #ifndef H5 || MP-WEIXIN -->
      <view class="py-24rpx text-center">
        请在微信小程序中打开礼品卡并赠送好友，当前端暂不支持赠送。
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  padding: 32rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
  overflow: hidden;
  background: #f7f1ea;
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

.receive-url {
  display: block;
  padding: 20rpx;
  font-size: 26rpx;
  line-height: 1.55;
  color: #604737;
  overflow-wrap: anywhere;
  user-select: text;
  background: #faf5ef;
  border: 2rpx solid #eee2d7;
  border-radius: 16rpx;
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
  background: #754e37 !important;
  border: none !important;
  box-shadow: 0 12rpx 40rpx rgb(139 111 71 / 30%) !important;
}
</style>
