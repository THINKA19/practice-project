<script setup lang="ts">
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { ref, watch } from 'vue'
import OrderGoodsCard from './components/OrderGoodsCard.vue'
import OrderStatusCard from './components/OrderStatusCard.vue'
import OrderPaymentPopup from './components/OrderPaymentPopup.vue'
import { useOrderDetail } from './composables'
import { currentLocale, t } from '@/locale'

defineOptions({ name: 'OrderDetailPage' })
definePage({
  style: {
    navigationBarTitleText: '订单详情',
    disableScroll: true,
  },
})
const { scene, scenes, selectScene, loading, failed, orderId, money, paymentShow, paymentConfirm, orderDetail, shopSubdetail, fetchOrderDetail, toPayTap, callShop } = useOrderDetail()

/** 导航栏标题：definePage 里的是编译期静态兜底，这里按当前语言覆盖 */
function setTitle() {
  uni.setNavigationBarTitle({ title: t('tabbar.pickup1') })
}

const pageVisible = ref(false)
watch(currentLocale, () => {
  if (pageVisible.value)
    setTitle()
})
onHide(() => {
  pageVisible.value = false
})

onLoad(setTitle)

// 用 onShow 而不是 onLoad：从支付页回来时订单状态已经变了，必须重新取一次
onShow(() => {
  pageVisible.value = true
  setTitle()
  fetchOrderDetail()
})
</script>

<template>
  <z-paging style="--wot-color-theme: #8b4513" fixed :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false" :paging-style="{ background: 'linear-gradient(180deg,#F5E6D3 0%,#FFF8F0 100%)' }">
    <view class="p-24rpx pb-40rpx">
      <view class="w-full">
        <view class="mb-24rpx text-[#8b4513]">
          {{ t('pickupPreview.pickupDemo') }} · {{ t('pickupPreview.demoPay') }}
        </view>
        <view class="mb-24rpx flex flex-wrap items-center gap-16rpx">
          <wd-button v-for="item in scenes" :key="item.value" size="small" :plain="scene !== item.value" :custom-class="scene === item.value ? '!bg-[#8b4513] !border-[#8b4513] !text-white' : '!bg-transparent !border-transparent !text-[#8b4513]'" @click="selectScene(item.value)">
            {{ t(item.label) }}
          </wd-button>
        </view>
        <view class="mb-24rpx">
          <wd-button plain block custom-class="!bg-white !border-[#8b4513] !text-[#8b4513]" @click="navigate(ClientRoutes.Pickup.listDemo)">
            {{ t('demoFlow.listEntry') }}
          </wd-button>
        </view>
        <view v-if="loading || failed || !orderDetail" class="py-80rpx text-center text-[#8b6f47]">
          {{ t(loading ? 'common.loading' : failed ? 'common.loadFailed' : 'orderDoing.empty') }}
          <wd-button v-if="failed" plain @click="fetchOrderDetail">
            {{ t('common.retry') }}
          </wd-button>
          <wd-button v-else-if="!loading && !orderDetail" plain @click="navigate(ClientRoutes.Ordering.order)">
            {{ t('orderDoing.goOrder') }}
          </wd-button>
        </view>
        <!-- 订单状态卡片（5 种状态共用一张卡，核销码画布收在组件里） -->
        <OrderStatusCard :order-info="orderDetail?.orderInfo" @pay="toPayTap" />

        <!-- 店铺信息卡片 -->
        <view v-if="shopSubdetail" class="mb-24rpx rounded-20rpx bg-white p-32rpx shadow-[0_4rpx_16rpx_rgba(139,69,19,0.08)]">
          <view class="mb-24rpx flex items-center border-0 border-b-2 border-b-[#F5E6D3] border-solid pb-20rpx">
            <view class="i-carbon-store mr-12rpx text-36rpx text-[#8B4513]" />
            <view class="text-32rpx text-[#8B4513] font-bold">
              {{ t('orderDetail.shopInfo') }}
            </view>
          </view>
          <view class="flex items-center justify-between">
            <view class="flex-1">
              <view class="mb-12rpx text-32rpx text-[#333333] font-bold">
                {{ shopSubdetail.info.name }}
              </view>
              <view class="text-26rpx text-[#666666] leading-40rpx">
                {{ shopSubdetail.info.address }}
              </view>
            </view>
            <view v-if="shopSubdetail.info.linkPhone" class="ml-24rpx flex flex-col items-center justify-center rounded-16rpx bg-[linear-gradient(135deg,#FFF8F0_0%,#F5E6D3_100%)] p-20rpx px-24rpx" @click="callShop">
              <view class="i-carbon-phone text-48rpx text-[#8B4513]" />
              <view class="mt-8rpx text-22rpx text-[#8B4513]">
                {{ t('orderDetail.contact') }}
              </view>
            </view>
          </view>
        </view>

        <!-- 收货地址卡片 -->
        <view v-if="orderDetail?.logistics" class="mb-24rpx rounded-20rpx bg-white p-32rpx shadow-[0_4rpx_16rpx_rgba(139,69,19,0.08)]">
          <view class="mb-24rpx flex items-center border-0 border-b-2 border-b-[#F5E6D3] border-solid pb-20rpx">
            <view class="i-carbon-location mr-12rpx text-36rpx text-[#8B4513]" />
            <view class="text-32rpx text-[#8B4513] font-bold">
              {{ t('orderDetail.logisticsInfo') }}
            </view>
          </view>
          <view class="text-28rpx">
            <view class="mb-16rpx flex items-center">
              <view class="mr-24rpx text-32rpx text-[#333333] font-bold">
                {{ orderDetail.logistics.linkMan }}
              </view>
              <view class="text-28rpx text-[#666666]">
                {{ orderDetail.logistics.mobile }}
              </view>
            </view>
            <view class="text-28rpx text-[#666666] leading-44rpx">
              {{ orderDetail.logistics.provinceStr }}{{ orderDetail.logistics.cityStr }}{{ orderDetail.logistics.areaStr }}{{ orderDetail.logistics.address }}
            </view>
          </view>
        </view>

        <!-- 商品信息卡片 -->
        <OrderGoodsCard
          v-if="orderDetail"
          :goods="orderDetail.goods"
          :amount-real="orderDetail.orderInfo.amountReal"
        />

        <!-- 订单信息卡片 -->
        <view class="mb-24rpx rounded-20rpx bg-white p-32rpx shadow-[0_4rpx_16rpx_rgba(139,69,19,0.08)]">
          <view class="mb-24rpx flex items-center border-0 border-b-2 border-b-[#F5E6D3] border-solid pb-20rpx">
            <view class="i-carbon-list mr-12rpx text-36rpx text-[#8B4513]" />
            <view class="text-32rpx text-[#8B4513] font-bold">
              {{ t('orderDetail.orderInfo') }}
            </view>
          </view>
          <view class="text-26rpx">
            <view class="flex items-center justify-between py-16rpx leading-40rpx">
              <view class="text-[#999999]">
                {{ t('orderDetail.dateAdd') }}
              </view>
              <view class="text-right text-[#666666]">
                {{ orderDetail?.orderInfo.dateAdd }}
              </view>
            </view>
            <view v-if="orderDetail?.orderInfo.status === -1" class="flex items-center justify-between py-16rpx leading-40rpx">
              <view class="text-[#999999]">
                {{ t('orderDetail.cancelTime') }}
              </view>
              <view class="text-right text-[#666666]">
                {{ orderDetail.orderInfo.dateClose }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </z-paging>
  <OrderPaymentPopup v-model="paymentShow" :money="money" :order-no="orderId" @confirm="paymentConfirm" />
</template>
