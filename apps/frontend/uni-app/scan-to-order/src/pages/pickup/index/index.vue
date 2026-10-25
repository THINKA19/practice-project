<script setup lang="ts">
/**
 * 取餐（tab 页，View：只做装配与渲染）
 * 来源：bee-master/pages/order-details/doing
 */
import { toLoginPage } from '@/utils/toLoginPage'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import DoingOrderCard from './components/DoingOrderCard.vue'
import { useOrderDoingPage } from './composables/useOrderDoingPage'

definePage({
  style: {
    navigationBarTitleText: '取餐',
    disableScroll: true,
  },
})

const { t } = useI18n()
const vm = useOrderDoingPage()
const { apiOk, orderList, items, loading, failed, needsLogin } = vm
const fulfillment = ref<'pickup' | 'delivery'>('pickup')
const visibleItems = computed(() => items.value.filter(item => !!item.order.isNeedLogistics === (fulfillment.value === 'delivery')))

onShow(() => {
  uni.setNavigationBarTitle({ title: t('tabbar.pickup') })
  vm.refresh()
})
</script>

<template>
  <view class="page" style="--wot-color-theme: #8b4513">
    <view class="flex flex-wrap gap-16rpx p-24rpx">
      <wd-button v-for="value in (['pickup', 'delivery'] as const)" :key="value" :plain="fulfillment !== value" :custom-class="fulfillment === value ? '!bg-[#8b4513] !border-[#8b4513] !text-white' : '!bg-transparent !border-transparent !text-[#8b4513]'" @click="fulfillment = value">
        {{ t(value === 'pickup' ? 'orderDoing.qudanhao' : 'orderDoing.delivering') }}
      </wd-button>
    </view>
    <view v-if="loading || failed || needsLogin" class="flex flex-1 flex-col items-center justify-center gap-24rpx p-32rpx text-center text-[#8b6f47]">
      <text>{{ t(loading ? 'common.loading' : needsLogin ? 'pickupState.loginHint' : 'common.loadFailed') }}</text>
      <wd-button v-if="!loading" :custom-class="needsLogin ? '!bg-[#169b50] !border-0 !text-white' : ''" @click="needsLogin ? toLoginPage() : vm.refresh()">
        {{ t(needsLogin ? 'pickupState.login' : 'common.retry') }}
      </wd-button>
    </view>
    <z-paging v-else-if="apiOk && !visibleItems.length" style="flex: 1; min-height: 0" :paging-style="{ background: 'transparent' }" :fixed="false" height="100%" :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false">
      <view class="no-order">
        <view class="empty-icon">
          🥤
        </view>
        <view class="content-1">
          {{ t('orderDoing.empty') }}
        </view>
        <view class="content-2">
          {{ t('orderDoing.emptyTips') }}
        </view>
        <view class="to-index-btn" @tap="vm.toIndexPage()">
          {{ t('orderDoing.goOrder') }}
        </view>
      </view>
    </z-paging>
    <z-paging v-else-if="orderList" class="order-list" :paging-style="{ background: 'transparent' }" :fixed="false" height="100%" :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false">
      <view v-for="item in visibleItems" :key="item.order.id" class="mb-24rpx">
        <DoingOrderCard :item="item" show-qrcode />
      </view>
    </z-paging>
  </view>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: var(--window-top, 0px);
  bottom: var(--window-bottom, 0px);
  left: 0;
  right: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5e6 0%, #ffe4d1 50%, #fff0e6 100%);
}

.no-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 200rpx;
}

.empty-icon {
  margin-bottom: 40rpx;
  font-size: 120rpx;
}

.content-1 {
  margin-top: 20rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #8b6f47;
  text-align: center;
}

.content-2 {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #a89080;
  text-align: center;
}

.to-index-btn {
  width: 320rpx;
  height: 88rpx;
  margin-top: 60rpx;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 88rpx;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #ff9f5a 0%, #ff7b3e 100%);
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 159, 90, 0.3);
}

.order-list {
  flex: 1;
  min-height: 0;
}
</style>
