<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import OrderImage from './components/OrderImage/index.vue'
import { ORDER_TABS } from './models/enums'
import { useOrderDetailPage } from './composables/use-detail-page'

definePage({ style: { navigationBarTitleText: '订单详情' } })
const { detail, loading, failed, needsLogin, init, load, login } = useOrderDetailPage()
onLoad(init)
onShow(() => {
  void load()
})
</script>

<template>
  <view class="detail-page">
    <view v-if="needsLogin">
      登录后查看订单详情<button @tap="login">
        去登录
      </button>
    </view>
    <view v-else-if="loading">
      加载中…
    </view>
    <view v-else-if="failed">
      订单加载失败<button @tap="load">
        重试
      </button>
    </view>
    <view v-else-if="detail" class="detail-card">
      <view class="status-title">
        {{ detail.orderInfo.statusStr }}
      </view>
      <view class="shop-title">
        <OrderImage :src="detail.orderInfo.shopImage" label="暂无门店照片" class="shop-image" />
        <view>
          <view>{{ detail.orderInfo.shopNameZt || '订单门店' }}</view><view class="fulfillment">
            {{ ORDER_TABS.find(tab => tab.key === detail?.orderInfo.orderType)?.label || '履约方式待确认' }}
          </view>
        </view>
      </view>
      <view class="info-row">
        <text>订单编号</text><text selectable>{{ detail.orderInfo.orderNumber }}</text>
      </view>
      <view class="info-row">
        <text>下单时间</text><text>{{ detail.orderInfo.dateAdd }}</text>
      </view>
      <view v-for="goods in detail.goods" :key="goods.id" class="goods-row">
        <OrderImage :src="goods.pic" class="goods-image" />
        <view class="goods-info">
          <view>{{ goods.goodsName }}</view><text class="goods-count">× {{ goods.number }}</text>
        </view><text>¥{{ Number(goods.amount).toFixed(2) }}</text>
      </view>
      <view class="total-row">
        <text>{{ detail.orderInfo.status === 0 ? '待付金额' : detail.orderInfo.status === -1 ? '订单金额' : '实付金额' }}</text><text class="total-price">¥{{ Number(detail.orderInfo.amountReal).toFixed(2) }}</text>
      </view>
      <view v-if="detail.logistics">
        收货人：{{ detail.logistics.linkMan }} {{ detail.logistics.mobile }}<view>{{ detail.logistics.address }}</view>
      </view>
    </view>
    <view v-else>
      暂无订单
    </view>
  </view>
</template>

<style scoped>
.detail-page {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 32rpx 24rpx;
  background: #fff9f5;
  color: #4a3428;
  font-size: 28rpx;
}
.detail-card {
  padding: 32rpx;
  background: #fff;
  border-radius: 24rpx;
}
.status-title {
  margin-bottom: 32rpx;
  color: #8b7355;
  font-size: 42rpx;
  line-height: 1.5;
  font-weight: 600;
}
.shop-image {
  flex-shrink: 0;
  width: 112rpx;
  height: 112rpx;
}
.fulfillment {
  margin-top: 8rpx;
  font-size: 24rpx;
  font-weight: 400;
  color: #91775e;
}
.shop-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 28rpx;
  font-size: 30rpx;
  font-weight: 600;
}
.info-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  margin: 20rpx 0;
  font-size: 24rpx;
  line-height: 1.6;
}
.info-row > text:first-child {
  flex-shrink: 0;
  color: #91775e;
}
.info-row > text:last-child {
  text-align: right;
  min-width: 0;
  overflow-wrap: anywhere;
}
.goods-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 0;
  border-top: 1rpx solid #f0e6dc;
}
.goods-image {
  flex-shrink: 0;
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  background: #f7f0e7;
}
.goods-info {
  flex: 1;
  min-width: 0;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.goods-count {
  color: #91775e;
  font-size: 24rpx;
}
.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  margin-bottom: 24rpx;
  border-top: 1rpx solid #f0e6dc;
}
.total-price {
  color: #8b7355;
  font-size: 36rpx;
  font-weight: 600;
}
</style>
