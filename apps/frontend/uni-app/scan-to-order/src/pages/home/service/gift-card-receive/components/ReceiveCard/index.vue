<!--
============================================================================
【文件概述】
礼品卡领取领域展示层；接收响应式状态并委托控制器处理交互，不直接调用接口。

【方法与导出清单】
ReceiveCard：默认组件；vm 为 ReturnType<typeof useGiftReceivePage>，由同领域页面创建。

【综合使用示例】
```typescript
import ReceiveCard from './components/ReceiveCard/index.vue'
import { useGiftReceivePage } from './composables/use-page'
const vm = useGiftReceivePage() // 在父页面 setup 中调用
// 页面模板：<ReceiveCard :vm="vm" />
```
============================================================================
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { useGiftReceivePage } from '../../composables/use-page'

const { vm } = defineProps<{ vm: ReturnType<typeof useGiftReceivePage> }>()
const { user, cardUser, cardInfo, submitting, completed, invalid, failed, failureMessage, loginRequired } = vm
const { t } = useI18n()
</script>

<template>
  <view class="page-container">
    <view v-if="completed" class="receive-state" role="status">
      <view class="mb-24rpx">
        {{ t('card.receive.success') }}
      </view>
      <wd-button block custom-class="receive-button" @click="vm.goToWallet()">
        查看我的礼品卡
      </wd-button>
    </view>
    <view v-else-if="invalid" class="receive-state" role="alert">
      赠送链接不完整，请让好友重新分享。
    </view>
    <view v-else-if="loginRequired" class="receive-state">
      登录后可继续领取这份礼品卡。
      <wd-button class="mt-24rpx" block custom-class="receive-button" @click="vm.loginToReceive()">
        去登录
      </wd-button>
    </view>
    <view v-else-if="failed" class="receive-state" role="alert">
      {{ failureMessage || '暂时无法确认领取状态，请检查网络后重新查询。' }}
      <wd-button class="mt-24rpx" block custom-class="receive-button" :disabled="submitting" @click="vm.retry()">
        重新查询
      </wd-button>
    </view>
    <view v-else-if="!cardInfo" class="receive-state" role="status">
      {{ submitting ? '正在加载礼品卡…' : '暂无可领取的礼品卡' }}
    </view>
    <view v-else class="main-card">
      <view class="mb-32rpx flex items-center py-20rpx">
        <view class="relative mr-24rpx">
          <image class="sender-avatar" :src="user?.avatarUrl || '/static/images/who.png'" mode="aspectFill" />
        </view>
        <view class="flex-1">
          <view class="mb-8rpx text-36rpx text-#5c3317 font-bold">
            {{ user?.nick || t('card.receive.friend') }}
          </view>
          <view class="text-26rpx text-#a67c52 opacity-80">
            送来一张礼品卡
          </view>
        </view>
      </view>

      <view v-if="cardInfo?.shareContent" class="blessing-card">
        <view class="blessing-text">
          {{ cardInfo?.shareContent }}
        </view>
      </view>

      <view class="relative my-48rpx">
        <view class="card-wrapper">
          <image class="h-full w-full" :src="cardInfo.pic || '/static/images/gift-card/classic.png'" mode="aspectFill" />
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

      <view v-if="cardUser?.dateEnd" class="text-center text-26rpx text-#8b6f47">
        有效期至 {{ cardUser.dateEnd }}
      </view>
      <view class="mt-32rpx">
        <wd-button block size="large" custom-class="receive-button" :disabled="submitting" :loading="submitting" @click="vm.submit()">
          确认领取
        </wd-button>
      </view>

      <view class="mt-16rpx text-center text-24rpx text-#6f594c">
        领取后可在礼品卡「我的」中查看
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  padding: 32rpx 24rpx calc(32rpx + env(safe-area-inset-bottom));
  color: #4f3528;
  background: #fff;
}

.main-card,
.receive-state {
  width: 100%;
}

.main-card {
  animation: reveal-card 220ms ease-out both;
}

.receive-state {
  line-height: 1.55;
  text-align: center;
}

.sender-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
}

.blessing-card {
  padding: 24rpx;
  margin-bottom: 28rpx;
  background: #faf3ec;
  border-radius: 16rpx;
}

.blessing-text {
  font-size: 28rpx;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.card-wrapper {
  width: 100%;
  height: 360rpx;
  overflow: hidden;
  background: #faf3ec;
  border-radius: 20rpx;
}

.card-divider {
  width: 64rpx;
  height: 4rpx;
  margin: 16rpx auto;
  background: #ddc5b3;
  border-radius: 2rpx;
}

.card-amount {
  display: inline-flex;
  align-items: baseline;
  padding: 12rpx 32rpx;
  background: #faf3ec;
  border-radius: 24rpx;
}

.amount-number {
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1;
  color: #754e37;
}

:deep(.receive-button) {
  font-weight: 600;
  color: #fff;
  background: #754e37;
  border-color: #754e37;
}

@keyframes reveal-card {
  from {
    opacity: 0;
    transform: translateY(8rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .main-card {
    animation: none;
  }
}
</style>
