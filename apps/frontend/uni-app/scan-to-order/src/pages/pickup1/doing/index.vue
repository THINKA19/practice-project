<script setup lang="ts">
import DeliveryCodeCard from './components/DeliveryCodeCard/index.vue'
import DoingLogisticsCard from './components/DoingLogisticsCard/index.vue'
import DoingOrderCard from './components/DoingOrderCard/index.vue'
import PickupCodeCard from './components/PickupCodeCard/index.vue'
import { useOrderDoingView } from './composables/use-view'

defineOptions({ name: 'OrderDoing' })
definePage({
  style: {
    navigationBarTitleText: '取餐中',
    disableScroll: true,
  },
})

const { PageState, toLoginPage, ClientRoutes, navigate, t, scene, scenes, selectScene, apiOk, orderList, logisticsMap, goodsMap, fetchOrderList, loading, failed, needsLogin, setTitle, pageVisible } = useOrderDoingView()
</script>

<template>
  <view class="doing-page flex flex-col bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE4D1_50%,#FFF0E6_100%)]">
    <view class="shrink-0 p-24rpx text-[#8b4513]">
      {{ t('demoFlow.listHint') }}
      <view class="mt-16rpx flex flex-wrap gap-16rpx">
        <wd-button v-for="item in scenes" :key="item" size="small" :plain="scene !== item" :custom-class="scene === item ? '!bg-[#8b4513] !border-[#8b4513] !text-white' : '!bg-transparent !border-transparent !text-[#8b4513]'" @click="selectScene(item)">
          {{ t(`pickupState.${item}`) }}
        </wd-button>
      </view>
    </view>
    <PageState v-if="loading || failed || needsLogin" fill :status="loading ? 'loading' : needsLogin ? 'empty' : 'error'" :title="t(loading ? 'common.loading' : needsLogin ? 'pickupState.loginHint' : 'pickupState.unavailable')">
      <wd-button v-if="!loading && needsLogin" custom-class="!bg-[#169b50] !border-0 !text-white" @click="toLoginPage()">
        {{ t('pickupState.login') }}
      </wd-button>
    </PageState>
    <PageState v-else-if="apiOk && !orderList?.length" status="empty" fill :title="t('pickupPreview.empty')" :description="t('pickupPreview.emptyHint')" />

    <z-paging v-else style="--wot-color-theme: #8b4513; flex: 1; min-height: 0" :fixed="false" :paging-style="{ background: 'transparent' }" height="100%" :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false">
      <!-- 多个订单按纵向列表展示，避免轮播隐藏其他订单。 -->
      <view>
        <view v-for="order in orderList" :key="order.id" class="mb-24rpx">
          <view class="p-40rpx px-30rpx pb-24rpx">
            <!-- 取单号卡片（自取） -->
            <view v-if="order.fulfillment === 'preparing'" class="mb-32rpx rounded-32rpx bg-white p-48rpx text-center text-[#8b6f47]">
              <wd-icon name="time" size="48px" />
              <view class="mt-24rpx text-36rpx">
                {{ t('pickupState.preparing') }}
              </view>
              <view class="mt-16rpx">
                {{ t('pickupState.preparingHint') }}
              </view>
            </view>
            <PickupCodeCard
              v-else-if="!order.isNeedLogistics"
              :qudanhao="order.qudanhao"
              :hx-number="order.hxNumber"
            />

            <!-- 配送卡片 -->
            <DeliveryCodeCard
              v-else
              :hx-number="order.hxNumber"
            />

            <view v-if="order.fulfillment !== 'preparing'" class="mb-24rpx">
              <wd-button block custom-class="!bg-[#8B4513] !border-0 !rounded-24rpx" @click="navigate(ClientRoutes.Pickup.orderScanResult, { hxNumber: order.hxNumber, demo: '1' })">
                {{ t('demoFlow.verifyEntry') }}
              </wd-button>
            </view>
            <!-- 配送地址卡片 -->
            <DoingLogisticsCard
              v-if="logisticsMap && logisticsMap[order.id]"
              :logistics="logisticsMap[order.id]"
            />

            <!-- 订单详情卡片 -->
            <DoingOrderCard
              :goods="goodsMap?.[order.id] || []"
              :amount-real="order.amountReal"
              :date-add="order.dateAdd"
            />

            <!-- 底部装饰 -->
            <view class="mt-40rpx flex items-center justify-center py-32rpx">
              <view class="h-2rpx max-w-120rpx flex-1 bg-[linear-gradient(90deg,transparent_0%,#E5D5C5_50%,transparent_100%)]" />
              <view class="px-24rpx text-24rpx text-[#C4B5A8] font-light tracking-2rpx">
                {{ t('orderDoing.footer') }}
              </view>
              <view class="h-2rpx max-w-120rpx flex-1 bg-[linear-gradient(90deg,transparent_0%,#E5D5C5_50%,transparent_100%)]" />
            </view>
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<style lang="scss" scoped>
.doing-page {
  position: fixed;
  top: var(--window-top, 0px);
  bottom: var(--window-bottom, 0px);
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>
