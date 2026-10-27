<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import GiftCardItem from './components/GiftCardItem/index.vue'
import MyGiftCard from './components/MyGiftCard/index.vue'
import { CARD_TAB_MY, useCardPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '礼品卡', navigationBarBackgroundColor: '#ffffff', navigationBarTextStyle: 'black', backgroundColor: '#f7f7f7', disableScroll: true } })
const { t } = useI18n()
const vm = useCardPage()
const { active, cardList, cardMyList, loading, failed } = vm
onLoad(query => void vm.init(query as { tab?: string }))
onShow(() => void vm.refresh())
</script>

<template>
  <z-paging :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false">
    <template #top>
      <view class="gift-tabs" role="tablist" aria-label="礼品卡分类">
        <button class="gift-tab" :class="{ 'is-active': active === 0 }" role="tab" :aria-selected="active === 0" @tap="vm.tabChange(0)">
          {{ t('card.tabBuy') }}
        </button>
        <button class="gift-tab" :class="{ 'is-active': active === CARD_TAB_MY }" role="tab" :aria-selected="active === CARD_TAB_MY" @tap="vm.tabChange(CARD_TAB_MY)">
          {{ t('card.tabMy') }}
        </button>
      </view>
    </template>
    <view class="gift-content">
      <view v-if="active === 0" class="gift-notice">
        在线购买暂未开放，可先查看卡片；持兑换码或好友赠送链接可领取。
      </view>
      <view v-else class="exchange-entry" @tap="vm.goExchange()">
        <view>
          <view class="text-30rpx text-#333 font-600">
            {{ t('card.exchange.title') }}
          </view><view class="mt-8rpx text-24rpx text-#777">
            {{ t('card.exchangeDesc') }}
          </view>
        </view>
        <text>→</text>
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
          <GiftCardItem v-for="item in cardList" :key="item.id" :card="item" buy-text="查看详情" @buy="vm.buy(item)" />
        </view>
      </template>
      <template v-else>
        <view v-if="!cardMyList.length" class="gift-state">
          暂无礼品卡。领取好友赠送或兑换成功后，会显示在这里。
        </view>
        <MyGiftCard v-for="item in cardMyList" :key="item.id" :card="item" @send="vm.sendUser(item)" @cancel-share="vm.cardShareClose(item)" @logs="vm.goLogs(item)" />
      </template>
    </view>
  </z-paging>
</template>

<style scoped>
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
  min-height: 100%;
  box-sizing: border-box;
  padding: 28rpx 24rpx 48rpx;
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
.exchange-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}
.retry-button {
  margin-top: 20rpx;
  font-size: 28rpx;
}
</style>
