<script setup lang="ts">
import ScanCouponCard from './components/ScanCouponCard/index.vue'
import ScanFeeCard from './components/ScanFeeCard/index.vue'
import ScanGoodsCard from './components/ScanGoodsCard/index.vue'
import ScanLogisticsCard from './components/ScanLogisticsCard/index.vue'
import { useScanResultView } from './composables/use-view'

defineOptions({ name: 'ScanResult' })
definePage({
  style: {
    navigationBarTitleText: '扫码核销',
    disableScroll: true,
  },
})

const { t, demo, permissionDenied, hxNumber, orderDetail, canHx, loading, failed, verified, submitting, init, fetchOrderDetail, doneHx, returnToList, setTitle, pageVisible } = useScanResultView()
</script>

<template>
  <z-paging fixed :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: 'linear-gradient(135deg,#FFF5E6 0%,#FFE8CC 50%,#FFDAB3 100%)' }">
    <view class="pb-32rpx">
      <!-- 核销标识 -->
      <view class="animate-[fadeInDown_0.6s_ease-out] pb-40rpx pt-50rpx text-center">
        <view class="mx-auto mb-20rpx h-100rpx w-100rpx center rounded-full bg-[linear-gradient(135deg,#A0673E_0%,#8B5A3C_100%)] text-60rpx text-white font-bold shadow-[0_8rpx_24rpx_rgba(139,90,60,0.3)]">
          <view :class="verified ? 'i-carbon-checkmark' : 'i-carbon-document'" />
        </view>
        <view class="mb-12rpx text-36rpx text-[#5D3A1A] font-bold tracking-2rpx">
          {{ t(verified ? 'orderScan.completed' : 'orderScan.headerTitle') }}
        </view>
        <view class="text-26rpx text-[#8B7355] opacity-90">
          {{ t(verified ? 'orderScan.completed' : 'orderScan.headerTips') }}
        </view>
        <view v-if="demo" class="mt-16rpx text-26rpx text-[#8B7355]">
          {{ t('demoFlow.verifyEntry') }}
        </view>
      </view>

      <view v-if="loading" class="py-48rpx text-center text-[#8B7355]">
        {{ t('common.loading') }}
      </view>
      <view v-else-if="permissionDenied || !hxNumber || failed" class="mx-24rpx mb-24rpx rounded-24rpx bg-white p-32rpx text-center text-[#8B7355]">
        <view>{{ t(permissionDenied ? 'orderScan.staffOnly' : hxNumber ? 'orderScan.loadFailed' : 'orderScan.missingCode') }}</view>
        <wd-button v-if="hxNumber && !permissionDenied" custom-class="mt-24rpx" @click="fetchOrderDetail">
          {{ t('common.retry') }}
        </wd-button>
      </view>
      <!-- 配送信息卡片 -->
      <ScanLogisticsCard v-if="orderDetail?.logistics" :logistics="orderDetail.logistics" />

      <!-- 商品信息卡片 -->
      <ScanGoodsCard v-if="orderDetail" :goods="orderDetail.goods" />

      <!-- 优惠信息卡片 -->
      <ScanCouponCard v-if="orderDetail?.goodsCoupons?.length" :coupons="orderDetail.goodsCoupons" />

      <!-- 费用明细卡片 -->
      <ScanFeeCard v-if="orderDetail" :order-info="orderDetail.orderInfo" />
    </view>

    <!-- 核销按钮：只有待取餐 / 配送中才给点 -->
    <template #bottom>
      <view v-if="demo && verified" class="bg-white px-24rpx pb-32rpx pt-16rpx">
        <wd-button block custom-class="!bg-[#8b4513] !border-[#8b4513] !text-white" @click="returnToList">
          {{ t('orderScan.returnToList') }}
        </wd-button>
      </view>
      <view v-if="canHx || submitting" class="bg-[linear-gradient(to_top,rgba(255,255,255,1)_0%,rgba(255,255,255,0.95)_80%,transparent_100%)] px-24rpx pb-32rpx pt-16rpx">
        <view
          class="h-96rpx w-full center rounded-48rpx bg-[linear-gradient(135deg,#A0673E_0%,#8B5A3C_100%)] text-32rpx text-white font-bold tracking-4rpx shadow-[0_8rpx_24rpx_rgba(139,90,60,0.4)] transition-all active:scale-98 active:shadow-[0_4rpx_12rpx_rgba(139,90,60,0.5)]"
          @click="doneHx"
        >
          {{ t(submitting ? 'common.loading' : 'orderScan.confirmVerification') }}
        </view>
      </view>
    </template>
  </z-paging>
</template>

<style lang="scss" scoped>
/* 仅保留卡片入场动画；其余样式全部由 UnoCSS 原子类实现 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
