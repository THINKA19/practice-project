<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】菜单选品 / index.vue
 * 页面入口：组装页面状态、生命周期与展示组件，页面仅由路由加载。
 * 【方法与导出清单】
 * - 路由页面。
 * 【综合使用示例】
 * import { ClientRoutes } from '@/pages/routes'
 * // 由页面路由加载 menu/index.vue；页面不作为组件 import。
 * ============================================================================
 */
import type { IndexPageQuery } from './models/types'
import { useOrderingPage } from './composables/use-page'

/**
 * 点餐选品页：View 只做装配与渲染，逻辑见 useOrderingPage 及各 useXxx ViewModel
 * 来源：bee-master/pages/index/index.{js,wxml,wxss,json}
 */
import { CartBar } from '@/components/cart-bar'
import CartPopup from './components/cart/CartPopup/index.vue'
import CategorySidebar from './components/catalog/CategorySidebar/index.vue'
import GoodsList from './components/catalog/GoodsList/index.vue'
import NoticeBar from './components/NoticeBar/index.vue'
import { BannerCarousel } from '@/components/banner-carousel'
import { useOrderingLocale } from './composables/use-locale'
import PingtuanPopup from './components/selection/PingtuanPopup/index.vue'
import ScanModeBar from './components/ScanModeBar/index.vue'
import ShopHeader from './components/ShopHeader/index.vue'
import SkuPopup from './components/selection/SkuPopup/index.vue'

definePage({
  style: {
    navigationBarTitleText: '',
    disableScroll: true,
  },
})

const { t } = useOrderingLocale()
const vm = useOrderingPage()
const { shop, menu, cart, sku, pingtuan } = vm

onLoad((query) => {
  vm.init((query || {}) as IndexPageQuery)
})

onShow(() => {
  vm.onShow()
})

onShareAppMessage(() => vm.shareMessage())
</script>

<template>
  <view class="index-page">
    <NoticeBar v-if="vm.notices.value.length" :notices="vm.notices.value" @open="vm.goNotice" />
    <view v-if="vm.adBanners.value.some(item => item.picUrl?.trim())" class="global-ad-slot">
      <BannerCarousel :items="vm.adBanners.value" height="150rpx" :label="t('menuState.advertisement')" @select="vm.tapBanner" />
    </view>

    <ShopHeader
      :shop="shop.shop.value"
      :delivery-type="shop.peisongType.value"
      :dine-in="shop.isScanMode.value"
      :table-code="shop.tableCode.value"
      @detail="shop.goShopDetail()"
    />

    <view class="menu-box">
      <CategorySidebar
        v-if="menu.navigationCategories.value.length && !menu.isEmpty.value && !menu.failed.value"
        :categories="menu.navigationCategories.value"
        :active="menu.navigationActive.value"
        :badges="cart.badges.value.byCategory"
        @select="menu.selectNavigationCategory"
      />
      <GoodsList
        :sections="menu.sections.value"
        :banners="vm.banners.value"
        :countdowns="menu.countdowns.value"
        :actions="menu.goodsActions.value"
        :badges="cart.badges.value.byGoods"
        :adding-goods="cart.addingGoods.value"
        :scroll-into-view="menu.scrollIntoView.value"
        :empty="menu.isEmpty.value"
        :loading="menu.loading.value"
        :failed="menu.failed.value"
        @retry="shop.loadShop"
        @visible-category="menu.onVisibleCategory"
        @reach-bottom="menu.loadMore"
        @tap-banner="vm.tapBanner"
        @open="g => vm.openGoods(g.id)"
        @add="cart.quickAdd"
        @detail="vm.goGoodsDetail"
      />
    </view>

    <view v-if="vm.cartBar.visible.value" class="order-notice">
      {{ t('cart.orderNotice') }}
    </view>
    <cart-bar
      v-if="vm.cartBar.visible.value"
      v-bind="vm.cartBar.props.value"
      @toggle-cart="vm.cartBar.listeners.toggleCart"
      @pay="vm.cartBar.listeners.pay"
      @get-shop="vm.cartBar.listeners.getShop"
    />

    <ScanModeBar
      v-if="shop.isScanMode.value"
      @cart="shop.goScanCart"
      @ordered="shop.goScanOrdered"
      @waimai="shop.exitScanMode"
    />

    <CartPopup
      :show="cart.showPopup.value"
      :items="cart.items.value"
      :changing-items="cart.changingItems.value"
      :clearing="cart.clearing.value"
      :locked="cart.checkingOut.value || cart.clearing.value || cart.editingCart.value || cart.confirmingClear.value"
      :clear-blocked="cart.clearBlocked.value"
      @close="cart.hideCart"
      @clear="cart.clear"
      @change="cart.changeNumber"
    />

    <SkuPopup
      :show="sku.visible.value"
      :picture="sku.picture.value"
      :name="sku.detail.value?.basicInfo.name || ''"
      :content="sku.detail.value?.content"
      :property-groups="sku.propertyGroups.value"
      :addition-groups="sku.additionGroups.value"
      :time-groups="sku.timeGroups.value"
      :price="sku.quote.value?.price ?? 0"
      :number="sku.number.value"
      :min="sku.minBuy.value"
      :max="sku.quote.value?.maxBuy ?? sku.minBuy.value"
      :pingtuan-mode="sku.pingtuanMode.value"
      :submitting="sku.submitting.value"
      @close="vm.closeGoodsPopups"
      @property="sku.chooseProperty"
      @addition="sku.chooseAddition"
      @time="sku.chooseTime"
      @update:number="sku.setNumber"
      @add-cart="sku.addToCart"
      @pingtuan-buy="pingtuan.buy"
    />

    <PingtuanPopup
      :show="pingtuan.visible.value"
      :goods="pingtuan.goods.value"
      :number-order="pingtuan.numberOrder.value"
      :remain="pingtuan.remain.value"
      :avatars="pingtuan.avatars.value"
      @close="vm.closeGoodsPopups"
      @buy-original="pingtuan.buyOriginal"
      @start-group="pingtuan.startGroupBuy"
      @reopen="pingtuan.reopen"
    />
  </view>
</template>

<style lang="scss" scoped>
.index-page {
  color: var(--app-text-primary, #2c2416);
  position: fixed;
  top: var(--window-top, 0px);
  right: 0;
  bottom: var(--window-bottom, 0px);
  left: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #faf8f5 0%, #fff 100%);
}

.order-notice {
  flex-shrink: 0;
  padding: 10rpx 24rpx;
  font-size: 22rpx;
  font-weight: 400;
  line-height: 32rpx;
  color: #806b55;
  text-align: center;
  white-space: nowrap;
  background: #fff9f0;
}

.global-ad-slot {
  flex-shrink: 0;
  margin: 0 24rpx 16rpx;
}

.menu-box {
  display: flex;
  box-sizing: border-box;
  flex: 1;
  gap: 16rpx;
  min-height: 0;
  padding: 0 24rpx 24rpx;
  overflow: hidden;
}
</style>
