<script setup lang="ts">
import { toLoginPage } from '@/utils/toLoginPage'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { ref, watch } from 'vue'
import DeliveryCodeCard from './components/DeliveryCodeCard.vue'
import DoingLogisticsCard from './components/DoingLogisticsCard.vue'
import DoingOrderCard from './components/DoingOrderCard.vue'
import PickupCodeCard from './components/PickupCodeCard.vue'
import { useOrderDoing } from './composables'
import { currentLocale, t } from '@/locale'

defineOptions({ name: 'OrderDoing' })
definePage({
  style: {
    navigationBarTitleText: '取餐中',
    disableScroll: true,
  },
})
const { scene, scenes, selectScene, apiOk, orderList, logisticsMap, goodsMap, fetchOrderList, toIndexPage, loading, failed, needsLogin } = useOrderDoing()

/** 导航栏标题：definePage 里的是编译期静态兜底，这里按当前语言覆盖 */
function setTitle() {
  uni.setNavigationBarTitle({ title: t('orderDoing.title') })
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

// 用 onShow 而不是 onLoad：从详情页返回、或刚下完单切过来，都要重新取一次
onShow(() => {
  pageVisible.value = true
  setTitle()
  fetchOrderList()
})
</script>

<template>
  <view class="doing-page flex flex-col bg-[linear-gradient(135deg,#FFF5E6_0%,#FFE4D1_50%,#FFF0E6_100%)]">
    <z-paging style="--wot-color-theme: #8b4513; flex: 1; min-height: 0" :fixed="false" :paging-style="{ background: 'transparent' }" height="100%" :use-page-scroll="false" :auto="false" :hide-empty-view="true" :refresher-enabled="false" :loading-more-enabled="false">
      <view class="p-24rpx text-[#8b4513]">
        {{ t('demoFlow.listHint') }}
        <view class="mt-16rpx flex flex-wrap gap-16rpx">
          <wd-button v-for="item in scenes" :key="item" size="small" :plain="scene !== item" :custom-class="scene === item ? '!bg-[#8b4513] !border-[#8b4513] !text-white' : '!bg-transparent !border-transparent !text-[#8b4513]'" @click="selectScene(item)">
            {{ t(`pickupState.${item}`) }}
          </wd-button>
        </view>
      </view>
      <view v-if="loading || failed || needsLogin" class="flex flex-1 flex-col items-center justify-center gap-24rpx text-[#8b6f47]">
        <text>{{ t(loading ? 'common.loading' : needsLogin ? 'pickupState.loginHint' : 'common.loadFailed') }}</text>
        <wd-button v-if="failed || needsLogin" @click="needsLogin ? toLoginPage() : fetchOrderList">
          {{ t(needsLogin ? 'pickupState.login' : 'common.retry') }}
        </wd-button>
      </view>
      <!-- 空状态 -->
      <view v-else-if="apiOk && !orderList" class="mt-200rpx flex flex-col animate-[fadeIn_0.6s_ease] items-center justify-center">
        <view class="i-carbon-cafe mb-40rpx animate-[float_3s_ease-in-out_infinite] text-120rpx text-[#FF9F5A] opacity-60" />
        <view class="mt-20rpx text-center text-32rpx text-[#8B6F47] font-medium">
          {{ t('orderDoing.empty') }}
        </view>
        <view class="mt-16rpx text-center text-28rpx text-[#A89080]">
          {{ t('orderDoing.emptyTips') }}
        </view>
        <view
          class="mt-60rpx h-88rpx w-320rpx rounded-48rpx bg-[linear-gradient(135deg,#FF9F5A_0%,#FF7B3E_100%)] text-center text-32rpx text-white font-medium leading-88rpx shadow-[0_8rpx_24rpx_rgba(255,159,90,0.3)] transition-transform active:scale-95"
          @click="toIndexPage"
        >
          {{ t('orderDoing.goOrder') }}
        </view>
      </view>

      <!-- 多个订单按纵向列表展示，避免轮播隐藏其他订单。 -->
      <view v-else>
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

/* 仅保留空状态/图标动画；其余样式全部由 UnoCSS 原子类实现 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}
</style>
