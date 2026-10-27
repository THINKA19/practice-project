<script setup lang="ts">
import OrderCard from './components/OrderCard/index.vue'
import OrdersEmpty from './components/OrdersEmpty/index.vue'
import { useOrderListPage } from './composables/use-list-page'

definePage({ style: { navigationBarTitleText: '我的订单', navigationStyle: 'custom', navigationBarBackgroundColor: '#ffffff', backgroundColor: '#fff0e7' } })
const vm = useOrderListPage()
const { apiOk, needsLogin, loading, failed, cards, activeTab, tabs } = vm
onShow(() => {
  void vm.refresh()
})
</script>

<template>
  <view class="orders-page">
    <z-paging :paging-content-style="needsLogin ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false">
      <OrdersEmpty v-if="needsLogin" title="登录后查看订单" desc="登录后可查看您的订单和进度" button-text="去登录" login-action @action="vm.login()" />
      <view v-else-if="failed && !cards.length" class="px-48rpx py-120rpx text-center text-28rpx text-#91775e">
        暂时无法获取订单
        <view class="mt-24rpx" @tap="vm.refresh()">
          点击重试
        </view>
      </view>
      <OrdersEmpty v-else-if="apiOk && !loading && !cards.length" :title="activeTab === 'all' ? '还没有订单' : '当前分类暂无订单'" desc="下单后，您可以在这里查看订单进度" button-text="去点餐" @action="vm.toIndexPage()" />
      <view v-else-if="cards.length" class="box-border w-full p-16rpx">
        <view v-if="failed" class="py-24rpx text-center text-24rpx text-#91775e" @tap="vm.refresh()">
          刷新失败，当前显示上次数据，点击重试
        </view>
        <OrderCard
          v-for="card in cards" :key="card.order.id" :card="card"
          @detail="vm.toDetail(card.order.id)" @call-shop="vm.callShop(card.order.shopIdZt || card.order.shopId, card.order.demo === true)"
          @delete="vm.deleteOrder(card.order.id)" @cancel="vm.cancelOrder(card.order.id)"
          @refund="vm.refundApply(card.order.id)" @pay="vm.toPay(card.order)"
        />
        <view class="py-24rpx text-center text-24rpx text-gray-400">
          当前分类已加载的订单
        </view>
      </view>
      <template #top>
        <wd-navbar left-arrow safe-area-inset-top custom-style="background-color: #ffffff;" @click-left="vm.goBack()">
          <template #title>
            <text class="text-32rpx text-black font-normal">我的订单</text>
          </template>
        </wd-navbar>
        <view class="order-tabs flex">
          <view
            v-for="tab in tabs" :key="tab.key" class="order-tab min-w-0 flex-1 py-28rpx text-center text-24rpx"
            :class="activeTab === tab.key ? 'order-tab-active' : ''" @tap="activeTab = tab.key"
          >
            {{ tab.label }}
          </view>
        </view>
      </template>
    </z-paging>
  </view>
</template>

<style scoped>
.orders-page {
  width: 100%;
  min-height: 100vh;
  background: #fff0e7;
  --z-paging-bg-color: #fff0e7;
  --wot-color-theme: #8b7355;
}
.order-tabs {
  background: #eee3d5;
}
.order-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 96rpx;
  line-height: 1.4;
  color: #000;
  font-weight: 400;
}
.order-tab-active {
  color: #76583e;
  font-weight: 600;
}
.order-tab-active::after {
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 28rpx;
  height: 6rpx;
  content: '';
  background: #8b7355;
  border-radius: 6rpx;
}
</style>
