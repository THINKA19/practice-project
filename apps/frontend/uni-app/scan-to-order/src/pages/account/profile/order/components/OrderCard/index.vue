<script setup lang="ts">
/**
 * 订单卡片（纯展示：props 进 / emit 出）
 */
import OrderImage from '../OrderImage/index.vue'
import type { OrderCardVM } from './types'

defineOptions({ name: 'OrderCard' })

defineProps<{
  card: OrderCardVM
}>()

const emit = defineEmits<{
  detail: []
  callShop: []
  delete: []
  cancel: []
  refund: []
  pay: []
}>()
</script>

<template>
  <view class="a-order">
    <!-- 订单头部：店铺名称 + 订单状态 -->
    <view class="order-header">
      <view class="shop-info">
        <wd-icon name="shop" size="22px" color="#8b7355" custom-class="mr-16rpx" />
        <view class="min-w-0">
          <view class="shop-name">
            {{ card.order.shopNameZt || '订单详情' }}
          </view>
          <view v-if="card.typeText" class="mt-6rpx text-22rpx text-#91775e">
            {{ card.typeText }}
          </view>
        </view>
      </view>
      <view class="order-status" :class="card.statusClass" @tap.stop="emit('detail')">
        <text class="status-text">
          {{ card.statusText }}
        </text>
        <text class="arrow">
          ›
        </text>
      </view>
    </view>
    <!-- 商品图片横向滚动 -->
    <scroll-view v-if="card.goods.length" class="goods-scroll" scroll-x :show-scrollbar="false">
      <view class="goods-container" @tap="emit('detail')">
        <view v-for="goods in card.goods" :key="goods.id" class="goods-item">
          <OrderImage :src="goods.pic" class="goods-img" />
          <view class="goods-badge">
            {{ goods.number }}
          </view>
          <view class="goods-name">
            {{ goods.goodsName }}
          </view>
        </view>
      </view>
    </scroll-view>
    <!-- 订单信息 -->
    <view class="order-detail">
      <view class="detail-row">
        <view class="detail-label">
          <text>{{ '下单时间' }}</text>
        </view>
        <view class="detail-value">
          {{ card.order.dateAdd }}
        </view>
      </view>
      <view class="detail-row">
        <view class="detail-label">
          <text>{{ '订单编号' }}</text>
        </view>
        <view class="detail-value">
          {{ card.order.orderNumber }}
        </view>
      </view>
    </view>
    <!-- 价格和操作 -->
    <view class="order-footer">
      <view class="price-area">
        <text class="price-label">
          {{ card.order.status === 0 ? '待付金额' : card.order.status === -1 ? '订单金额' : '实付金额' }}
        </text>
        <view class="price-value">
          <text class="currency">
            ¥
          </text>
          <text class="amount">
            {{ Number(card.order.status === -1 ? (card.order.amount ?? card.order.amountReal) : card.order.amountReal).toFixed(2) }}
          </text>
        </view>
      </view>
      <view v-if="card.showCallShop || card.showDelete || card.showCancel || card.showRefund || card.showPay" class="action-btns">
        <view v-if="card.showCallShop" class="order-btn btn-secondary" @tap="emit('callShop')">
          <text class="btn-icon">📞</text><text>{{ '联系商家' }}</text>
        </view>
        <view v-if="card.showDelete" class="order-btn btn-danger" @tap="emit('delete')">
          <text class="btn-icon">🗑</text><text>{{ '删除记录' }}</text>
        </view>
        <view v-if="card.showCancel" class="order-btn btn-cancel" @tap="emit('cancel')">
          <text class="btn-icon">×</text><text>{{ '取消订单' }}</text>
        </view>
        <view v-if="card.showRefund" class="order-btn btn-warning" @tap="emit('refund')">
          <text class="btn-icon">↩</text><text>{{ card.order.refundStatus ? '查看售后' : '申请售后' }}</text>
        </view>
        <view v-if="card.showPay" class="order-btn btn-primary" @tap="emit('pay')">
          <text class="btn-icon">💳</text><text>{{ '去支付' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.a-order {
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 24rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  border-top: 4rpx solid #d7a47d;
  box-shadow: 0 4rpx 12rpx #b38b6620;
}
.order-header,
.detail-row,
.price-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.order-header,
.order-detail,
.order-footer {
  padding: 24rpx;
}
.shop-info {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
}
.shop-name {
  overflow: hidden;
  font-size: 30rpx;
  font-weight: 600;
  color: #76583e;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shop-icon,
.label-icon,
.btn-icon {
  margin-right: 8rpx;
}
.order-status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40rpx;
  line-height: 1.4;
  flex-shrink: 0;
  font-size: 24rpx;
  color: #fff;
  background: #8b7355;
  padding: 4rpx 12rpx;
  border-radius: 24rpx;
}
.status-pending {
  background: #ff8a00;
}
.status-success {
  background: #13b88a;
}
.status-cancel {
  background: #aaa;
}
.arrow {
  margin-left: 8rpx;
}
.goods-scroll {
  box-sizing: border-box;
  width: 100%;
  white-space: nowrap;
}
.goods-container {
  display: inline-flex;
  gap: 16rpx;
  padding: 24rpx;
}
.goods-item {
  position: relative;
  flex-shrink: 0;
  width: 160rpx;
}
.goods-img {
  width: 160rpx;
  height: 160rpx;
  background: #f5f6f8;
  border-radius: 16rpx;
}
.goods-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 28rpx;
  padding: 0 4rpx;
  text-align: center;
  color: #fff;
  background: #d7a47d;
  border-radius: 8rpx;
  font-size: 22rpx;
}
.goods-name {
  overflow: hidden;
  font-size: 24rpx;
  color: #91775e;
  text-overflow: ellipsis;
}
.detail-row {
  margin-bottom: 12rpx;
  font-size: 24rpx;
  color: #91775e;
}
.order-detail {
  background: linear-gradient(#fffaf7, #fff);
}
.detail-label {
  flex-shrink: 0;
}
.detail-value {
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: right;
}
.price-area {
  margin-bottom: 24rpx;
}
.price-label {
  font-size: 26rpx;
  color: #91775e;
}
.price-value {
  color: #8b7355;
}
.currency {
  font-size: 24rpx;
}
.amount {
  font-size: 38rpx;
  font-weight: 600;
}
.action-btns {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 16rpx;
}
.order-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64rpx;
  line-height: 1.4;
  flex: 0 1 auto;
  min-width: 160rpx;
  text-align: center;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 40rpx;
}
@media (max-width: 600px) {
  .order-btn {
    flex: 0 1 auto;
    min-width: 0;
  }
}
.btn-primary {
  color: #fff;
  background: #8b7355;
  border-color: transparent;
}
.btn-secondary,
.btn-cancel {
  color: #76583e;
  background: #f7f0e7;
  border-color: #e7d8c7;
}
.btn-danger {
  color: #d9534f;
  background: #fff0f0;
  border-color: #ffd6d6;
}
.btn-warning {
  color: #a87521;
  background: #fff7df;
  border-color: #f5e5b8;
}
</style>
