<script setup lang="ts">
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import GiftCardItem from './components/GiftCardItem/index.vue'
import MyGiftCard from './components/MyGiftCard/index.vue'
import { CARD_TAB_MY, useCardPage } from './composables/use-page'
import { BannerCarousel } from '@/components/banner-carousel'
import { PaymentPanel } from '@/pages/ordering/menu-pay'

definePage({ style: { navigationBarTitleText: '礼品卡', navigationBarBackgroundColor: '#ffffff', navigationBarTextStyle: 'black', backgroundColor: '#f7f7f7', disableScroll: true } })
const { t } = useI18n()
const vm = useCardPage()
const isDemo = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
const { active, cardList, cardMyList, loading, failed, visibleCards, visibleMyCards, hasMore, selectedCard, paymentShow, nextAction, banners, cancellingId } = vm
onLoad(query => void vm.init(query as { tab?: string }))
onShow(() => void vm.refresh())
onShareAppMessage(vm.shareAppMessage)
onShareTimeline(vm.shareTimeline)
</script>

<template>
  <scroll-view scroll-y class="gift-page" refresher-enabled :refresher-triggered="vm.refreshing.value" @refresherrefresh="vm.pullRefresh()" @scrolltolower="hasMore && vm.loadMore()">
    <view class="sticky top-0 z-10">
      <view class="gift-tabs" role="tablist" aria-label="礼品卡分类">
        <button class="gift-tab" :class="{ 'is-active': active === 0 }" role="tab" :aria-selected="active === 0" @tap="vm.tabChange(0)">
          {{ t('card.tabBuy') }}
        </button>
        <button class="gift-tab" :class="{ 'is-active': active === CARD_TAB_MY }" role="tab" :aria-selected="active === CARD_TAB_MY" @tap="vm.tabChange(CARD_TAB_MY)">
          {{ t('card.tabMy') }}
        </button>
      </view>
    </view>
    <view class="gift-content">
      <BannerCarousel v-if="active === 0 && banners.length" :items="banners" height="280rpx" @select="vm.tapBanner($event.linkUrl)" />
      <view v-if="active === 0" class="gift-notice">
        选一张礼品卡送上心意，购买后可在「我的」查看和赠送。
      </view>
      <view v-else class="grid grid-cols-2 mb-24rpx gap-16rpx">
        <button class="wallet-entry" hover-class="wallet-entry-pressed" @tap="vm.goExchange()">
          <view class="text-30rpx text-#333 font-600">
            {{ t('card.exchange.title') }}
          </view>
          <view class="mt-8rpx text-24rpx text-#777">
            {{ isDemo ? '使用 GIFT-DEMO 兑换测试卡（每个账户一次）' : t('card.exchangeDesc') }}
          </view>
        </button>
        <button class="wallet-entry wallet-entry-receive" hover-class="wallet-entry-pressed" @tap="vm.goReceive()">
          <view class="text-30rpx text-#333 font-600">
            领取好友赠送
          </view>
          <view class="mt-8rpx text-24rpx text-#777">
            <!-- #ifdef H5 -->
            粘贴领取链接
            <!-- #endif -->
            <!-- #ifndef H5 -->
            从好友分享的消息领取
            <!-- #endif -->
          </view>
        </button>
      </view>
      <view v-if="loading" class="gift-state">
        加载中…
      </view>
      <view v-else-if="failed" class="gift-state">
        礼品卡加载失败<button class="retry-button" @tap="vm.refresh()">
          重试
        </button>
      </view>
      <template v-else-if="active === 0">
        <view v-if="!cardList.length" class="gift-state">
          暂无可展示的礼品卡
        </view>
        <view v-else class="gift-grid">
          <view v-for="item in visibleCards" :key="item.id">
            <GiftCardItem :card="item" buy-text="立即购买" @buy="vm.buy(item)" />
            <button v-if="isDemo" :disabled="vm.demoBusy.value" class="retry-button" @tap="vm.demoPurchase(item)">
              模拟购卡（不支付）
            </button>
          </view>
        </view>
      </template>
      <template v-else>
        <view v-if="!cardMyList.length" class="gift-state">
          暂无礼品卡。购买、领取好友赠送或兑换成功后，会显示在这里。
        </view>
        <MyGiftCard
          v-for="item in visibleMyCards" :key="item.id" :card="item" :cancelling="cancellingId === item.id"
          @send="vm.sendUser(item)" @share-again="vm.shareAgain(item)" @cancel-share="vm.cardShareClose(item)"
          @details="vm.goLogs(item, 'details')"
        />
      </template>
      <button v-if="hasMore && !loading && !failed" class="retry-button" @tap="vm.loadMore()">
        加载更多
      </button>
      <view v-else-if="!loading && !failed && (active === 0 ? cardList.length : cardMyList.length)" class="gift-state">
        已经到底了
      </view>
    </view>
  </scroll-view>
  <PaymentPanel v-if="selectedCard" v-model="paymentShow" :money="selectedCard.price!" :remark="`购买礼品卡：${selectedCard.name}`" :next-action="nextAction" @ok="vm.paymentOk()" />
</template>

<style scoped>
.gift-page {
  width: 100%;
  height: calc(100vh - var(--window-top, 0px) - var(--window-bottom, 0px));
  background: #f7f7f7;
}
.gift-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}
.gift-tab {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 24rpx 0;
  border: 0;
  border-radius: 0;
  background: #fff;
  color: #777;
  font-size: 30rpx;
  line-height: 44rpx;
}
.gift-tab::after {
  border: 0;
}
.gift-tab.is-active {
  color: #8b5f3d;
  font-weight: 600;
}
.gift-tab.is-active::before {
  position: absolute;
  bottom: 0;
  left: calc(50% - 24rpx);
  width: 48rpx;
  height: 6rpx;
  border-radius: 4rpx;
  background: #8b5f3d;
  content: '';
}
.gift-content {
  box-sizing: border-box;
  padding: 28rpx 24rpx calc(48rpx + env(safe-area-inset-bottom));
  background: #f7f7f7;
}
.gift-notice {
  margin-bottom: 24rpx;
  color: #777;
  font-size: 24rpx;
  line-height: 38rpx;
}
.gift-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
}
.gift-state {
  padding: 60rpx 24rpx;
  color: #777;
  text-align: center;
  font-size: 28rpx;
  line-height: 44rpx;
}
.wallet-entry {
  width: 100%;
  min-height: 132rpx;
  margin: 0;
  padding: 20rpx 16rpx;
  border: 2rpx solid #eee2d7;
  border-radius: 20rpx;
  background: #fff;
  line-height: 1.4;
}
.wallet-entry-receive {
  border-color: #ddc5b3;
  background: #f8eee5;
}
.wallet-entry-pressed {
  filter: brightness(0.95);
}
.wallet-entry::after {
  border: 0;
}
.retry-button {
  margin-top: 20rpx;
  font-size: 28rpx;
}
</style>
