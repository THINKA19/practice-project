<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】商品搜索页面 / index.vue
 * 页面入口：组装页面状态、生命周期与展示组件，页面仅由路由加载。
 * 【方法与导出清单】
 * - 路由页面。
 * 【综合使用示例】
 * import { ClientRoutes } from '@/pages/routes'
 * // 由页面路由加载 menu-search/index.vue；页面不作为组件 import。
 * ============================================================================
 */
import { useGoodsSearchPage } from './composables/use-page'
import { PageState } from '@/components/page-state'
/**
 * 商品列表 / 搜索（View：只做装配与渲染）
 * 来源：bee-master/pages/goods/list
 */

import { GoodsItem, QuickSkuPanel, useOrderingLocale as useI18n } from '@/pages/ordering/menu'

import type { GoodsListQuery, GoodsOrderBy } from '@/pages/ordering/menu'

definePage({
  style: {
    navigationBarTitleText: '',
  },
})

const { t } = useI18n()
const vm = useGoodsSearchPage()
const { listType, name, orderBy, showSellerNumber, goods, isEmpty, loading, failed, skuGoods, skuBuyNumber } = vm

const filters = computed<Array<{ val: GoodsOrderBy, label: string }>>(() => [
  { val: '', label: t('goodsList.sort.zh') },
  { val: 'addedDown', label: t('goodsList.sort.xp') },
  { val: 'ordersDown', label: t('goodsList.sort.xl') },
  { val: 'priceUp', label: t('goodsList.sort.jg') },
])

onLoad((query) => {
  vm.init(query as GoodsListQuery)
})

onReachBottom(() => {
  vm.loadMore()
})
</script>

<template>
  <view class="page">
    <view class="sticky-box">
      <view class="header">
        <view class="search">
          <input
            v-model="name"
            type="text"
            confirm-type="search"
            :placeholder="t('common.searchPlaceholder')"
            @confirm="vm.confirmSearch()"
          >
          <image src="/static/images/icon/search.svg" @tap="vm.search()" />
        </view>
        <image class="show-type" :src="`/static/images/icon/list${listType}.svg`" @tap="vm.changeShowType()" />
      </view>
      <view class="filters">
        <view
          v-for="f in filters"
          :key="f.val"
          class="item"
          :class="{ active: orderBy === f.val }"
          @tap="vm.filter(f.val)"
        >
          {{ f.label }}
        </view>
      </view>
    </view>

    <PageState v-if="loading && !goods.length" status="loading" title="正在加载商品" />
    <view v-else-if="failed" class="p-32rpx">
      <PageState status="error" title="商品加载失败，请重试" />
      <button @tap="goods.length ? vm.loadMore() : vm.search()">
        重新加载
      </button>
    </view>
    <PageState v-else-if="isEmpty" status="empty" :title="t('common.empty')" />

    <view class="list-box" :class="{ grid: listType === 2 }">
      <GoodsItem
        v-for="item in goods"
        :key="item.id"
        :goods="item"
        :layout="listType"
        :show-seller-number="showSellerNumber === '1'"
        @open="vm.openGoods(item)"
        @add="vm.addShopCar(item)"
      />
    </view>

    <QuickSkuPanel
      v-if="skuGoods"
      :goods="skuGoods"
      :buy-number="skuBuyNumber"
      :is-active="vm.isSkuActive"
      @close="vm.closeSku()"
      @select="vm.skuSelect"
      @minus="vm.storesJian()"
      @plus="vm.storesJia()"
      @submit="vm.addCarSku()"
    />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background: linear-gradient(135deg, #fff5e6 0%, #ffe8d6 100%);
}

.sticky-box {
  position: sticky;
  top: var(--window-top, 0);
  z-index: 50;
}

.header {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx 20rpx;
  background: linear-gradient(135deg, #ffd4a3 0%, #ffc78e 100%);
  box-shadow: 0 4rpx 20rpx rgb(255 180 100 / 15%);

  .search {
    position: relative;
    flex: 1;
    height: 72rpx;

    input {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      padding-right: 72rpx;
      padding-left: 48rpx;
      font-size: 28rpx;
      color: #6b4e3d;
      background: rgb(255 255 255 / 95%);
      border-radius: 36rpx;
      box-shadow: 0 2rpx 12rpx rgb(255 180 100 / 10%);
    }

    image {
      position: absolute;
      top: 17rpx;
      right: 24rpx;
      z-index: 2;
      width: 38rpx;
      height: 38rpx;
      opacity: 0.7;
    }
  }

  .show-type {
    flex-shrink: 0;
    width: 44rpx;
    height: 44rpx;
    margin-left: 20rpx;
    opacity: 0.8;
  }
}

.filters {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 96rpx;
  padding: 0 16rpx;
  background: linear-gradient(135deg, #ffecd6 0%, #ffe5c8 100%);
  box-shadow: 0 2rpx 16rpx rgb(255 180 100 / 8%);

  .item {
    height: 60rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    line-height: 60rpx;
    color: #8b6f47;
    border-radius: 30rpx;
    transition: all 0.3s ease;
  }

  .active {
    font-weight: 600;
    color: #fff;
    background: var(--app-brand-primary, #8b4513);
    box-shadow: none;
  }
}

.list-box {
  padding: 0 16rpx;

  &.grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
