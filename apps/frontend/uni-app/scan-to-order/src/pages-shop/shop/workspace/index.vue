<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { computed, ref, watch } from 'vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { dashboardApi } from './api/dashboard'
import { useDashboard } from './composables/index/useDashboard'
import { useMenus } from './composables/index/useMenus'
import { ShopRoutes } from '@/pages-shop/routes'
import { navigate } from '@/utils/project/navigation'
import { merchantCurrency } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeStore } from '@/pages-shop/shop/index'
import { useShopExit } from '@/pages-shop/auth/login'
import { toast } from '@/utils/project/interaction'
import { useOrderCenterStore } from '@/pages-shop/order/index'

definePage({ style: { navigationBarTitleText: '商家工作台', navigationStyle: 'custom', enablePullDownRefresh: false } })

const { shopInfo, dashboardReady, store, error, loadDashboard, loadCurrentDashboard } = useDashboard()
const orderCenter = useOrderCenterStore()
const { menus, navigateMenu } = useMenus(computed(() => orderCenter.total))
const shopPicker = ref(false)
const switching = ref(false)
const { exiting, goBackClient } = useShopExit()
const notices = useMerchantNoticeStore()
const visible = ref(false)
const creatingDemo = ref(false)
const listening = computed(() => visible.value && !exiting.value && !switching.value && store.can('order.read'))
watch(listening, (active) => {
  if (active)
    notices.resume()
  else
    notices.pause()
}, { flush: 'sync' })
watch(() => notices.syncVersion, () => {
  if (listening.value)
    void loadCurrentDashboard()
})
watch([listening, () => store.revision, () => notices.orderChangeVersion], ([active]) => {
  if (active)
    void orderCenter.refresh()
})
const isOwner = computed(() => store.current?.roleTemplate === 'owner')
const canSwitch = computed(() => store.shops.length > 1)
const mixedRoles = computed(() => new Set(store.shops.map(shop => shop.roleTemplate)).size > 1)
const showOrders = computed(() => store.can('order.read'))
const showRevenue = computed(() => store.can('statistics.read'))
const headerStyle = ref<Record<string, string>>({})
async function createDemoOrder() {
  if (!isOwner.value || !dashboardApi.demoEnabled || !listening.value || !notices.ready || notices.eventError || creatingDemo.value)
    return
  creatingDemo.value = true
  try {
    await dashboardApi.createDemoOrder(store.capture('order.read'))
  }
  catch {
    toast(st('创建模拟订单失败'))
  }
  finally {
    creatingDemo.value = false
  }
}

function selectShop() {
  if (canSwitch.value && !store.loading && !switching.value)
    shopPicker.value = true
}
async function openMetric(metric: 'today' | 'revenue' | 'pending') {
  if (switching.value || exiting.value || !store.can(metric === 'revenue' ? 'statistics.read' : 'order.read'))
    return

  const result = metric === 'revenue'
    ? await navigate(ShopRoutes.Business.statistics)
    : metric === 'pending'
      ? await navigate(ShopRoutes.Operations.orders)
      : await navigate(ShopRoutes.Operations.orderList, { filter: metric })
  if (!result.ok)
    toast(st('无法打开详情，请重试'))
}

/** 切店成功后加载目标门店的概览。 */
async function chooseShop(id: string) {
  if (store.loading || switching.value)
    return
  if (id === store.current?.id) {
    shopPicker.value = false
    return
  }
  switching.value = true
  try {
    if (!await store.switchShop(id))
      return
    shopPicker.value = false
    if (store.error)
      toast(st(store.error))
    await loadCurrentDashboard()
  }
  finally {
    switching.value = false
  }
}

let visibilityVersion = 0
onShow(async () => {
  uni.setNavigationBarTitle({ title: t('shop.messages.merchantWorkspace') })
  // #ifdef MP-WEIXIN
  const capsule = uni.getMenuButtonBoundingClientRect()
  const { screenWidth } = uni.getWindowInfo?.() ?? uni.getSystemInfoSync()
  headerStyle.value = capsule?.width > 0
    ? { paddingTop: `${capsule.top}px`, paddingRight: `${screenWidth - capsule.left + 12}px` }
    : { paddingRight: '104px' }
  // #endif
  const shown = ++visibilityVersion
  await loadDashboard()
  if (shown === visibilityVersion)
    visible.value = true
})
function leave() {
  visibilityVersion++
  visible.value = false
  shopPicker.value = false
}
onHide(leave)
onUnload(leave)
watch(() => t('shop.messages.merchantWorkspace'), title => uni.setNavigationBarTitle({ title }))
watch(canSwitch, (enabled) => {
  if (!enabled)
    shopPicker.value = false
})
</script>

<template>
  <view class="role-workspace">
    <view class="role-header from-[#7d614a] to-[#6b503c] bg-gradient-to-br pb-5 text-white">
      <view class="box-border flex items-start gap-2 px-4 pt-[calc(var(--status-bar-height)+12px)]" :style="headerStyle">
        <button hover-class="none" class="store-trigger m-0 h-44px w-44px flex shrink-0 items-center justify-center p-0" :aria-label="st('退出商家账号')" :disabled="exiting" @click="goBackClient">
          <view class="i-carbon-chevron-left text-2xl" />
        </button>
        <view class="min-w-0 flex flex-1 flex-col items-start">
          <button
            v-if="canSwitch"
            class="store-trigger m-0 max-w-full min-h-44px inline-flex items-center gap-2 p-0 text-left text-base font-bold"
            :disabled="store.loading || switching"
            :aria-label="st('切换门店')"
            :aria-expanded="shopPicker"
            @click="selectShop"
          >
            <text class="min-w-0 truncate">{{ st(shopInfo.shopName || store.current?.name || '请选择门店') }}</text>
            <view class="i-carbon-chevron-down shrink-0 text-lg" />
          </button>
          <view v-else class="min-h-44px flex items-center">
            <text class="truncate text-base font-bold">{{ st(shopInfo.shopName || store.current?.name || '请选择门店') }}</text>
          </view>
          <view
            v-if="store.current"
            class="max-w-full inline-flex rounded-full bg-[#f9e5ac] px-2.5 py-1 text-xs text-[#513806] font-medium"
          >
            <text class="truncate">{{ st(isOwner ? '老板' : '员工') }}</text>
          </view>
        </view>
      </view>
      <view v-if="dashboardReady" class="mx-4 mt-3 flex">
        <view class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs">
          <view class="h-2 w-2 rounded-full" :class="shopInfo.open ? 'bg-green-300' : 'bg-gray-300'" />
          <text>{{ st(shopInfo.open ? '营业中' : '已打烊') }}</text>
        </view>
      </view>
      <view v-if="showOrders || showRevenue" class="grid grid-cols-3 mx-4 mt-4 gap-2">
        <button v-if="isOwner && showOrders" hover-class="none" class="metric-card m-0 min-w-0 rounded-xl bg-white/10 p-2 text-white" @click="openMetric('today')">
          <text class="block break-words text-lg font-bold">{{ dashboardReady ? shopInfo.today.orders : '—' }}</text>
          <view class="mt-1 flex items-center justify-center gap-1 text-xs">
            {{ st('今日订单') }} <view class="i-carbon-chevron-right shrink-0" />
          </view>
        </button>
        <button v-if="showRevenue" hover-class="none" class="metric-card m-0 min-w-0 rounded-xl bg-white/10 p-2 text-white" @click="openMetric('revenue')">
          <text class="block break-words text-lg font-bold"><FgPrice :amount="dashboardReady ? shopInfo.today.revenue : undefined" :currency-code="merchantCurrency(store.current)" amount-unit="settlement" /></text>
          <view class="mt-1 flex items-center justify-center gap-1 text-xs">
            {{ st('今日流水') }} <view class="i-carbon-chevron-right shrink-0" />
          </view>
        </button>
        <button v-if="showOrders" hover-class="none" class="metric-card m-0 min-w-0 rounded-xl bg-white/10 p-2 text-white" @click="openMetric('pending')">
          <text class="block break-words text-lg font-bold">{{ orderCenter.ready ? orderCenter.total : '—' }}</text>
          <view class="mt-1 flex items-center justify-center gap-1 text-xs">
            {{ t('shop.orderCenter.pendingTasks') }} <view class="i-carbon-chevron-right shrink-0" />
          </view>
        </button>
      </view>
    </view>

    <view class="role-content px-4 pt-4">
      <text v-if="error" class="mb-3 block rounded-lg bg-white p-3 text-sm text-[#a33a25]">
        {{ st(error) }}
      </text>
      <view v-if="!store.current && !store.loading" class="mb-4 rounded-2xl bg-white p-4">
        <text>{{ st(store.error || '请选择要管理的门店') }}</text>
        <wd-button v-if="canSwitch" block custom-class="!mt-3" @click="selectShop">
          {{ st('选择门店') }}
        </wd-button>
      </view>
      <view v-if="showOrders" class="mb-4 rounded-xl bg-white p-3">
        <view class="flex flex-wrap items-center justify-between gap-2">
          <text class="text-sm font-semibold">{{ st('新订单语音播报') }}</text>
          <wd-button v-if="store.current?.soundNotify" size="small" plain @click="notices.preview">
            {{ st('试听播报') }}
          </wd-button>
        </view>
        <wd-button v-if="isOwner && dashboardApi.demoEnabled" size="small" plain :disabled="!notices.ready || !!notices.eventError || creatingDemo" @click="createDemoOrder">
          <PageLoading v-if="creatingDemo" inline indicator-only size="28rpx" color="currentColor" class="mr-8rpx" />
          {{ st('模拟新订单') }}
        </wd-button>
        <text class="mt-1 block text-xs">{{ st(store.current?.soundNotify ? (notices.audioError || '收到新订单时自动播报') : '门店已关闭语音播报，请联系老板在店铺设置开启') }}</text>
        <text v-if="notices.latest" class="mt-1 block text-sm" aria-live="polite">{{ notices.latest }}</text>
        <text v-if="notices.eventError" class="mt-1 block text-xs text-[#a33a25]">{{ st(notices.eventError) }}</text>
      </view>
      <text v-if="menus.length" class="mb-3 block text-sm text-[#765c46] font-medium">{{ st('功能管理') }}</text>
      <view class="workspace-menu grid grid-cols-3 gap-2" :class="{ 'workspace-menu--owner': isOwner }">
        <view
          v-for="item in menus"
          :key="item.path"
          class="relative flex flex-col items-center gap-1 rounded-2xl bg-white px-2 py-2 text-center shadow-sm"
          @tap="navigateMenu(item)"
        >
          <view class="h-9 w-9 flex items-center justify-center rounded-xl from-[#da826c] to-[#a6816a] bg-gradient-to-br">
            <view class="text-xl text-white" :class="item.icon" />
          </view>
          <text v-if="item.badge" class="absolute right-2 top-2 min-w-5 rounded-full bg-[#a33a25] px-1.5 py-0.5 text-center text-xs text-white" :aria-label="`${t('shop.orderCenter.pendingTasks')} ${item.badge}`">{{ item.badge }}</text>
          <text class="text-sm text-[#573921] font-semibold">{{ st(item.label) }}</text>
        </view>
      </view>
    </view>
    <wd-popup
      v-model="shopPicker"
      position="bottom"
      custom-class="merchant-workspace-shop-popup"
      root-portal
      round
      safe-area-inset-bottom
      lock-scroll
      :close-on-click-modal="!switching"
    >
      <view class="shop-picker">
        <view class="shop-picker__title">
          {{ st('切换门店') }}
        </view>
        <text v-if="store.error" class="my-2 block text-sm text-[#a33a25]">{{ st(store.error) }}</text>
        <scroll-view scroll-y class="max-h-[50vh]">
          <button
            v-for="shop in store.shops"
            :key="shop.id"
            class="shop-picker__option"
            :class="{ 'shop-picker__option--active': shop.id === store.current?.id }"
            :disabled="store.loading || switching"
            @click="chooseShop(shop.id)"
          >
            <view class="min-w-0 flex flex-1 items-center gap-2">
              <text class="min-w-0 truncate">{{ st(shop.id === store.current?.id && shopInfo.shopName ? shopInfo.shopName : shop.name) }}</text>
              <text v-if="mixedRoles" class="shrink-0 rounded-full bg-[#f6ece1] px-2 py-1 text-xs">{{ st(shop.roleTemplate === 'owner' ? '老板' : '员工') }}</text>
            </view>
            <wd-icon v-if="shop.id === store.current?.id" name="check" size="18px" color="#018d71" :aria-label="st('进入当前门店')" />
          </button>
        </scroll-view>
        <button class="shop-picker__cancel" :disabled="switching" @click="shopPicker = false">
          {{ t('common.cancel') }}
        </button>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.role-header,
.role-content {
  box-sizing: border-box;
  width: 100%;
}
.role-workspace {
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: #fcf6ef;
  color: #573921;
}
.store-trigger,
.store-trigger:active,
.store-trigger[disabled] {
  background: transparent !important;
  color: inherit;
  line-height: 1.4;
}
.metric-card {
  width: 100%;
  text-align: center;
  line-height: 1.4;
}
.store-trigger::after,
.metric-card::after {
  border: 0;
}
.shop-picker {
  padding: 12px 16px;
  background: #fff;
}
.shop-picker__title {
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
  font-size: 14px;
  text-align: center;
}
.shop-picker__option,
.shop-picker__cancel {
  width: 100%;
  min-height: 48px;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 16px;
  line-height: 1.4;
}
.shop-picker__option::after,
.shop-picker__cancel::after {
  border: 0;
}
.shop-picker__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 0;
  background: #fff;
  color: #333;
  text-align: left;
}
.shop-picker__option--active {
  color: #018d71;
  font-weight: 600;
}
.shop-picker__cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  border-radius: 8px;
  background: #f7f7f7;
  color: #666;
  text-align: center;
}
.shop-picker__option:disabled,
.shop-picker__cancel:disabled {
  opacity: 0.55;
}
@media (min-width: 768px) {
  .workspace-menu {
    gap: 16px;
  }
  .workspace-menu--owner {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 1200px) {
  .workspace-menu--owner {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>

<style>
@media (min-width: 768px) {
  .merchant-workspace-shop-popup {
    width: 100%;
    max-width: 480px;
    margin-right: auto;
    margin-left: auto;
  }
}
</style>
