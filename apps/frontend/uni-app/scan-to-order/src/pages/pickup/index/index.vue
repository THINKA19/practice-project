<script setup lang="ts">
import { PageState } from '@/components/page-state'
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
    <PageState v-if="loading || failed || needsLogin" :status="loading ? 'loading' : needsLogin ? 'empty' : 'error'" :title="t(loading ? 'common.loading' : needsLogin ? 'pickupState.loginHint' : 'pickupState.unavailable')">
      <wd-button v-if="!loading && needsLogin" custom-class="!bg-[#169b50] !border-0 !text-white" @click="toLoginPage()">
        {{ t('pickupState.login') }}
      </wd-button>
    </PageState>
    <PageState v-else-if="apiOk && !visibleItems.length" status="empty" :title="t(!items.length ? 'pickupState.noOrders' : fulfillment === 'pickup' ? 'pickupState.noPickup' : 'pickupState.noDelivery')" :description="t(!items.length ? 'pickupState.emptyHint' : 'pickupState.filterHint')">
      <wd-button v-if="!items.length" custom-class="!bg-[#169b50] !border-0 !text-white" @click="vm.toIndexPage()">
        {{ t('orderDoing.goOrder') }}
      </wd-button>
    </PageState>
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

.order-list {
  flex: 1;
  min-height: 0;
}
</style>
