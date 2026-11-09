<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】平台商家列表组件；由底部点餐入口装配。
 * 【方法与导出清单】默认组件：分页、搜索、地区筛选、门店选择与位置恢复。
 * 【综合使用示例】import ShopSelectionPage from './components/ShopSelectionPage/index.vue'; // 仅本领域页面入口装配，不通过公共入口导出
 * ============================================================================
 */
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import { nextTick, ref } from 'vue'
import { clearShopSelectionTarget, takeShopListFreshEntry } from '../../navigation'
import RegionPicker from '../RegionPicker/index.vue'
import ShopCard from '../ShopCard/index.vue'
import { useShopSelectPage } from '../../composables/use-select-page'

const props = defineProps<{ booking?: boolean, bookingShopId?: number }>()
const emit = defineEmits<{ selectBookingShop: [shopId: number, shopName: string, shopAddress?: string, shopPic?: string] }>()
const { t } = useI18n()
const vm = useShopSelectPage(props.booking ? 'table-booking' : undefined)
const { paging, shops, searchValue, countryCode, cityCode, districtCode, regionLabel } = vm
const regionOpen = ref(false)
const categories = [{ key: 'all', label: '全部' }, { key: 'promotions', label: '优惠活动' }, { key: 'favorites', label: '我的收藏' }] as const
/** 打开时刷新后台开放范围。无参数。@returns void。@example openRegions() */
function openRegions() {
  regionOpen.value = true
  void vm.loadRegions()
}
onLoad((query) => {
  if (!props.booking)
    vm.init(query || {})
})
let firstShow = true
function resetList(defaultPickup = false) {
  regionOpen.value = false
  vm.resetFilters({ defaultPickup })
}
onShow(() => {
  if (props.booking) {
    vm.setVisible(true)
    return
  }
  void vm.favorites.load()
  const fresh = takeShopListFreshEntry()
  const directEntry = firstShow && !fresh
  firstShow = false
  void nextTick(() => {
    if (fresh || directEntry)
      resetList(directEntry)
    vm.setVisible(true)
    vm.restorePosition()
  })
})
onTabItemTap(() => {
  clearShopSelectionTarget()
  resetList(true)
})
onHide(() => {
  vm.setVisible(false)
  if (props.booking)
    return
  clearShopSelectionTarget()
})
</script>

<template>
  <z-paging
    ref="paging"
    v-model="shops"
    fixed
    :use-page-scroll="false"
    :default-page-size="6"
    :inside-more="true"
    :to-bottom-loading-more-enabled="true"
    :loading-more-default-as-loading="true"
    :paging-style="{ background: '#fff9f0' }"
    :empty-view-text="booking ? '没有找到支持订座的门店' : vm.emptyText.value"
    loading-more-no-more-text="已经显示全部门店"
    @query="vm.query"
    @scroll-top-change="vm.rememberScroll"
    @content-height-changed="vm.restorePosition"
  >
    <template #top>
      <view class="region-tip">
        <view class="h-40rpx flex shrink-0 items-center">
          <wd-icon name="sound" size="32rpx" color="#aa7848" />
        </view>
        <view class="region-tip-text">
          <text class="font-600">点击「地区」选国家/城市/区县，查找当地门店</text>
        </view>
      </view>
      <view class="search-wrapper">
        <view class="search-box">
          <view class="region-trigger" @tap="openRegions">
            <wd-icon name="location" size="28rpx" />
            <text class="region-label">{{ regionLabel }}</text>
            <view class="region-chevron" :class="{ 'region-chevron-open': regionOpen }" aria-hidden="true" />
          </view>
          <wd-icon name="search" size="32rpx" color="#a0826d" />
          <input class="min-w-0 flex-1 text-28rpx" :value="searchValue" placeholder="搜索门店名称或地址" confirm-type="search" @input="vm.searchChange($event.detail.value)" @confirm="vm.reload()">
          <view v-if="searchValue" class="px-12rpx py-16rpx text-24rpx text-[#8b4513]" @tap="vm.searchChange('')">
            清除
          </view>
        </view>
      </view>
      <view class="flex gap-16rpx bg-[#fff9f0] px-24rpx py-20rpx" role="tablist">
        <view v-for="tab in (booking ? [] : categories)" :key="tab.key" role="tab" :aria-selected="vm.category.value === tab.key" class="flex-1 rounded-full py-16rpx text-center text-26rpx" :class="vm.category.value === tab.key ? 'bg-[#8b4513] text-white font-600' : 'bg-white text-[#777]'" @tap="vm.changeCategory(tab.key)">
          {{ tab.label }}
        </view>
      </view>
      <view v-if="vm.category.value === 'favorites' && !vm.favoritesNeedLogin.value && vm.favorites.error" class="px-24rpx pb-16rpx text-24rpx text-[#8b4513]" @tap="vm.favorites.load()">
        {{ vm.favorites.error }}
      </view>
    </template>
    <template v-if="vm.category.value === 'favorites'" #empty="{ isLoadFailed }">
      <view class="px-48rpx py-64rpx text-center">
        <text class="block text-30rpx text-[#555]">{{ vm.favoritesNeedLogin.value ? '登录后查看收藏门店' : isLoadFailed ? '收藏加载失败，请重试' : vm.emptyText.value }}</text>
        <template v-if="vm.favoritesNeedLogin.value">
          <text class="mt-16rpx block text-26rpx text-[#888]">收藏喜欢的门店，下次找店更方便</text>
          <button class="favorites-login mt-32rpx rounded-full px-64rpx text-28rpx text-white" @tap="vm.loginForFavorites">
            去登录
          </button>
        </template>
        <button v-else-if="isLoadFailed" class="mt-32rpx text-28rpx text-[#8b4513]" @tap="vm.reload">
          重新加载
        </button>
        <template v-else-if="vm.category.value === 'favorites'">
          <text class="mt-16rpx block text-26rpx text-[#888]">进入门店后可点击收藏，也可以调整地区或搜索条件</text>
          <button class="mt-32rpx text-28rpx text-[#8b4513]" @tap="vm.changeCategory('all')">
            浏览全部门店
          </button>
        </template>
      </view>
    </template>
    <view class="px-24rpx pt-24rpx">
      <ShopCard v-for="(item, index) in shops" :key="item.id" :shop="item" :nearest="index === 0" :selected="(booking ? bookingShopId : vm.selectedShopId.value) === item.id" :select-text="booking ? '预约此门店' : t('shop.select')" @select="booking ? emit('selectBookingShop', item.id, item.name, item.address, item.pic) : vm.goShop($event || item)" />
    </view>
  </z-paging>
  <RegionPicker v-model="regionOpen" :regions="vm.regions.value" :loading="vm.regionsLoading.value" :error="vm.regionsError.value" :ready="vm.regionsReady.value" :selection="{ countryCode, cityCode, districtCode }" @retry="vm.loadRegions" @apply="vm.applyRegion" />
</template>

<style lang="scss" scoped>
.favorites-login {
  display: inline-block;
  background: var(--app-brand-primary, #8b4513);
}

.region-tip {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 18rpx 24rpx;
  font-size: 26rpx;
  line-height: 40rpx;
  color: var(--app-text-muted, #6f6258);
  background: #fff8f0;
}

.region-tip-text {
  flex: 1;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}

.search-wrapper {
  padding: 24rpx;
  background: var(--app-brand-primary, #8b4513);
}

.region-trigger {
  display: flex;
  flex-shrink: 0;
  gap: 8rpx;
  align-items: center;
  max-width: 210rpx;
  padding-right: 20rpx;
  font-size: 26rpx;
  color: #454545;
  border-right: 1rpx solid #e9ddd0;
}

.region-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.region-chevron {
  flex-shrink: 0;
  width: 10rpx;
  height: 10rpx;
  margin: -6rpx 4rpx 0 4rpx;
  border-right: 2rpx solid #a0826d;
  border-bottom: 2rpx solid #a0826d;
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.region-chevron-open {
  margin-top: 6rpx;
  transform: rotate(225deg);
}

.search-box {
  display: flex;
  gap: 16rpx;
  align-items: center;
  min-height: 80rpx;
  padding: 0 24rpx;
  background: #fff;
  border-radius: 40rpx;
}
</style>
