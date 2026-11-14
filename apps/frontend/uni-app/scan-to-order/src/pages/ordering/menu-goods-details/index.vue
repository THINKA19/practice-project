<script setup lang="ts">
import PageLoading from '@/components/page-loading/index.vue'
import FgPrice from '@/components/fg-price/fg-price.vue'
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】商品详情 / index.vue
 * 页面入口：组装页面状态、生命周期与展示组件，页面仅由路由加载。
 * 【方法与导出清单】
 * - 路由页面。
 * 【综合使用示例】
 * import { ClientRoutes } from '@/pages/routes'
 * // 由页面路由加载 goods-details/index.vue；页面不作为组件 import。
 * ============================================================================
 */
/**
 * 商品详情（View：只做装配与渲染）
 * 来源：bee-master/pages/goods-details/index
 */
import type { GoodsDetailQuery } from './models/types'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import GoodsPoster from './components/GoodsPoster/index.vue'
import KanjiaHelps from './components/KanjiaHelps/index.vue'
import KanjiaProgress from './components/KanjiaProgress/index.vue'
import SkuOptions from './components/SkuOptions/index.vue'
import { useGoodsDetailPage } from './composables/use-page'

const { countryCode } = useOrderingCurrency()

definePage({
  style: {
    navigationBarTitleText: '',
  },
})

const { t } = useI18n()
const vm = useGoodsDetailPage()
const { detail, basicInfo, shopSubdetail, videoMp4Src, skuShowType, commission, outOfStock } = vm
const sku = reactive(vm.sku)
const kanjia = reactive(vm.kanjia)
const poster = reactive(vm.poster)

onLoad((query) => {
  vm.init(query as GoodsDetailQuery)
})

onShow(() => {
  vm.onPageShow()
})

onShareAppMessage(() => vm.shareMessage())
</script>

<template>
  <view class="goods-detail-page">
    <PageLoading v-if="poster.generating || kanjia.joining" overlay />
    <!-- 商品图片 / 视频 -->
    <swiper
      class="swiper-box"
      indicator-dots
      indicator-color="rgba(255,255,255,0.5)"
      indicator-active-color="#D4A574"
      :autoplay="!basicInfo?.videoId"
      circular
    >
      <swiper-item v-if="basicInfo?.videoId">
        <video :src="videoMp4Src" autoplay loop class="h-full w-full" />
      </swiper-item>
      <swiper-item v-for="(item, index) in detail?.pics || []" :key="item.id || index">
        <image :src="item.pic" class="slide-image" mode="aspectFill" lazy-load @tap="vm.previewImage(item.pic)" />
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view v-if="basicInfo" class="goods-info-card">
      <view class="poster-entry" @tap="poster.drawSharePic()">
        <wd-icon name="share" size="36rpx" color="#C9935E" />
      </view>
      <view class="price-section">
        <view class="current-price">
          <text class="price-num"><FgPrice :amount="sku.selectSizePrice" :country-code="countryCode" show-currency-name /></text>
        </view>
        <view v-if="basicInfo.originalPrice && basicInfo.originalPrice > 0" class="original-price">
          <text><FgPrice :amount="sku.selectSizeOPrice" :country-code="countryCode" show-currency-name /></text>
        </view>
      </view>
      <view class="goods-title">
        {{ basicInfo.name }}
      </view>
      <view v-if="basicInfo.characteristic" class="characteristic-tag">
        <text class="tag-icon">✦</text>
        <text class="tag-text">{{ basicInfo.characteristic }}</text>
      </view>
      <view v-if="commission.type === 1" class="commission-tip">
        <text class="tip-icon">💰</text>
        {{ t('goodsDetail.commission1') }} {{ commission.value }} {{ t('goodsDetail.commission2') }}
      </view>
      <view v-if="commission.type === 2" class="commission-tip">
        <text class="tip-icon">💰</text>
        {{ t('goodsDetail.commission1') }} {{ commission.value }} {{ t('goodsDetail.commission3') }}
      </view>
    </view>

    <!-- 砍价设置与进度 -->
    <KanjiaProgress
      :kanjia-set="kanjia.curGoodsKanjia"
      :progress="kanjia.curKanjiaprogress"
      :percentage="kanjia.percentage"
    />

    <!-- 规格选择入口（弹窗模式） -->
    <view v-if="sku.hasMoreSelect && skuShowType === 0" class="spec-select-card" @tap="sku.openPopup()">
      <view class="spec-title">
        {{ t('common.select') }}
      </view>
      <view class="spec-content">
        <text v-for="item in detail?.properties || []" :key="`p-${item.id}`" class="spec-tag">{{ item.name }}</text>
        <text v-for="item in sku.additions || []" :key="`a-${item.id}`" class="spec-tag">{{ item.name }}</text>
      </view>
      <view class="spec-arrow">
        ›
      </view>
    </view>

    <!-- 展开式规格选择 -->
    <view v-if="skuShowType === 1" class="spec-select-expanded">
      <view class="section-header">
        <view class="header-line" />
        <view class="header-text">
          {{ t('goodsDetail.noSelectSku') }}
        </view>
        <view class="header-line" />
      </view>
      <SkuOptions
        :properties="detail?.properties"
        :is-prop-active="sku.isPropActive"
        @select-property="sku.selectProperty"
      />
      <view class="quantity-selector">
        <view class="quantity-label">
          {{ t('goodsDetail.buyNumber') }}
        </view>
        <wd-input-number
          :model-value="sku.buyNumber"
          :min="sku.buyNumMin"
          :max="Math.max(sku.buyNumMax, sku.buyNumMin)"
          :disabled="sku.buyNumMax < sku.buyNumMin"
          :update-on-init="false"
          @change="({ value }) => sku.stepChange(value)"
        />
      </view>
    </view>

    <!-- 门店信息 -->
    <view v-if="shopSubdetail" class="shop-info-card">
      <view class="shop-badge">
        <image mode="aspectFill" :src="shopSubdetail.info.pic" class="shop-avatar" />
      </view>
      <view class="flex-1">
        <view class="shop-name">
          {{ shopSubdetail.info.name }}
        </view>
        <view class="shop-address">
          📍 {{ shopSubdetail.info.address }}
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="goods-detail-card">
      <view class="detail-header">
        <view class="header-decorator" />
        <view class="header-title">
          {{ t('goodsDetail.title') }}
        </view>
        <view class="header-decorator right" />
      </view>
      <rich-text :nodes="detail?.content || ''" />
    </view>

    <!-- 砍价记录 -->
    <KanjiaHelps v-if="kanjia.curKanjiaprogress?.helps?.length" :helps="kanjia.curKanjiaprogress?.helps || []" />

    <!-- 砍价操作 -->
    <view v-if="kanjia.curGoodsKanjia && kanjia.curKanjiaprogress" class="kj-buy-button">
      <wd-button
        v-if="!kanjia.isOwner"
        type="primary"
        block
        :disabled="!!kanjia.myHelpDetail"
        @click="kanjia.helpKanjia()"
      >
        {{ kanjia.myHelpDetail ? t('goodsDetail.helped') : t('goodsDetail.helphe') }}
      </wd-button>
      <wd-button v-else type="danger" block @click="vm.onBuyTap()">
        {{ t('goodsDetail.buyUseCurPrice') }}
      </wd-button>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="basicInfo" class="goods-action">
      <template v-if="outOfStock">
        <wd-button class="action-btn" type="warning" disabled block>
          {{ t('goodsDetail.storeing') }}
        </wd-button>
      </template>
      <template v-else>
        <view v-if="kanjia.curKanjiaprogress" class="action-btn">
          <wd-button type="danger" block :disabled="!!kanjia.myHelpDetail" @click="kanjia.helpKanjia()">
            {{ kanjia.myHelpDetail ? t('goodsDetail.helped') : t('goodsDetail.helphe') }}
          </wd-button>
        </view>
        <view class="action-btn">
          <wd-button v-if="basicInfo.kanjia && !kanjia.curGoodsKanjia" type="warning" disabled block>
            {{ t('goodsDetail.ended') }}
          </wd-button>
          <wd-button
            v-else-if="kanjia.curGoodsKanjia && (!kanjia.curKanjiaprogress || !kanjia.isOwner)"
            type="warning"
            block
            @click="kanjia.joinKanjia()"
          >
            {{ t('goodsDetail.kanjiaBtn') }}
          </wd-button>
          <wd-button v-else-if="kanjia.curKanjiaprogress && kanjia.isOwner" type="warning" block @click="vm.onBuyTap()">
            <FgPrice :amount="kanjia.curKanjiaprogress.kanjiaInfo.curPrice" :country-code="countryCode" show-currency-name /> {{ t('goodsDetail.buy') }}
          </wd-button>
          <wd-button v-else type="warning" block @click="vm.onBuyTap()">
            {{ t('goodsDetail.addCartBtn') }}
          </wd-button>
        </view>
      </template>
    </view>
  </view>

  <!-- 分享海报 -->
  <GoodsPoster :source="poster.source" @close="poster.closePoster()" @fail="poster.onPosterFail" />

  <!-- 规格弹窗 -->
  <wd-popup
    v-model="sku.showPopup"
    position="bottom"
    closable
    round
    safe-area-inset-bottom
    custom-style="padding-top:48rpx;max-height:80%;"
  >
    <view class="popup-goods-card">
      <image class="popup-goods-image" :src="sku.skuGoodsPic" mode="aspectFill" />
      <view class="popup-goods-info">
        <view class="popup-goods-name">
          {{ basicInfo?.name }}
        </view>
        <view class="popup-price-row">
          <text class="popup-current-price"><FgPrice :amount="sku.selectSizePrice" :country-code="countryCode" show-currency-name /></text>
          <text v-if="sku.selectSizePrice !== sku.selectSizeOPrice" class="popup-original-price"><FgPrice :amount="sku.selectSizeOPrice" :country-code="countryCode" show-currency-name /></text>
        </view>
      </view>
    </view>
    <scroll-view scroll-y class="popup-spec-area">
      <SkuOptions
        :properties="detail?.properties"
        :additions="sku.additions"
        :schedule="sku.schedule"
        :is-prop-active="sku.isPropActive"
        :is-addition-active="sku.isAdditionActive"
        :is-time-active="sku.isTimeActive"
        @select-property="sku.selectProperty"
        @toggle-addition="sku.toggleAddition"
        @select-time="sku.selectTime"
      />
    </scroll-view>
    <view v-if="!kanjia.isOwner" class="popup-quantity">
      <view class="popup-quantity-label">
        {{ t('goodsDetail.buyNumber') }}
      </view>
      <wd-input-number
        :model-value="sku.buyNumber"
        :min="sku.buyNumMin"
        :max="Math.max(sku.buyNumMax, sku.buyNumMin)"
        :disabled="sku.buyNumMax < sku.buyNumMin"
        :update-on-init="false"
        @change="({ value }) => sku.stepChange(value)"
      />
    </view>
    <view class="popup-action-area">
      <view v-if="kanjia.isOwner" class="popup-confirm-btn" @tap="sku.addShopCar()">
        <FgPrice :amount="kanjia.curKanjiaprogress?.kanjiaInfo.curPrice" :country-code="countryCode" show-currency-name /> {{ t('goodsDetail.buy') }}
      </view>
      <view v-else class="popup-confirm-btn" @tap="sku.addShopCar()">
        {{ t('goodsDetail.addCartBtn') }}
      </view>
    </view>
  </wd-popup>
</template>

<style lang="scss" scoped>
.goods-detail-page {
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  min-height: 100vh;
  padding-bottom: calc(240rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #fdf8f3 0%, #f5efe7 100%);
}

/* 商品图片 */
.swiper-box {
  width: 100%;
  height: 750rpx;
  overflow: hidden;
  border-radius: 0 0 48rpx 48rpx;
}

.slide-image {
  display: block;
  width: 100%;
  height: 750rpx;
}

/* 商品信息卡片 */
.goods-info-card {
  position: relative;
  z-index: 10;
  padding: 40rpx 32rpx;
  margin: 24rpx;
  background: linear-gradient(135deg, #fff 0%, #fffbf7 100%);
  border-radius: 32rpx;
  box-shadow: 0 8rpx 32rpx rgb(212 165 116 / 15%);

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 6rpx;
    content: '';
    background: linear-gradient(90deg, #d4a574 0%, #c9935e 100%);
    border-radius: 32rpx 32rpx 0 0;
  }
}

.poster-entry {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  padding: 8rpx;
}

.price-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 24rpx;
}

.current-price {
  display: flex;
  align-items: baseline;
  color: #c93636;
}

.currency {
  margin-right: 4rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.price-num {
  font-size: 56rpx;
  font-weight: 700;
  letter-spacing: -1rpx;
}

.original-price {
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #c9935e;
  text-decoration: line-through;
}

.goods-title {
  margin-bottom: 16rpx;
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.5;
  color: #333;
  letter-spacing: 0.5rpx;
}

.characteristic-tag {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 24rpx;
  margin-bottom: 16rpx;
  background: linear-gradient(135deg, #fff5e8 0%, #ffe8cc 100%);
  border-radius: 40rpx;
}

.tag-icon {
  margin-right: 8rpx;
  font-size: 24rpx;
  color: #d4a574;
}

.tag-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #8b6f47;
}

.commission-tip {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #d4a574;
  background: linear-gradient(135deg, #fff9f0 0%, #fff3e0 100%);
  border: 1rpx solid #ffe8cc;
  border-radius: 16rpx;
}

.tip-icon {
  margin-right: 8rpx;
  font-size: 28rpx;
}

/* 规格选择入口 */
.spec-select-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  margin: 0 24rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(212 165 116 / 10%);
}

.spec-title {
  margin-right: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
}

.spec-content {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 12rpx;
}

.spec-tag {
  padding: 8rpx 16rpx;
  font-size: 26rpx;
  color: #999;
  background: #f8f8f8;
  border-radius: 8rpx;
}

.spec-arrow {
  margin-left: 16rpx;
  font-size: 48rpx;
  font-weight: 300;
  color: #d4a574;
}

/* 展开式规格选择 */
.spec-select-expanded {
  padding: 32rpx;
  margin: 0 24rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(212 165 116 / 10%);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.header-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #e8d5c4 50%, transparent 100%);
}

.header-text {
  padding: 0 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #8b6f47;
  letter-spacing: 2rpx;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24rpx;
  border-top: 2rpx solid #f5f5f5;
}

.quantity-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
}

/* 门店信息 */
.shop-info-card {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  margin: 0 24rpx 24rpx;
  background: linear-gradient(135deg, #fff 0%, #fffbf7 100%);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(212 165 116 / 10%);
}

.shop-badge {
  width: 96rpx;
  height: 96rpx;
  margin-right: 24rpx;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgb(212 165 116 / 20%);
}

.shop-avatar {
  width: 100%;
  height: 100%;
}

.shop-name {
  margin-bottom: 8rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.shop-address {
  font-size: 26rpx;
  line-height: 1.5;
  color: #999;
}

/* 商品详情 */
.goods-detail-card {
  padding: 40rpx 32rpx;
  margin: 0 24rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgb(212 165 116 / 10%);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.header-decorator {
  width: 80rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #d4a574 100%);

  &.right {
    background: linear-gradient(90deg, #d4a574 0%, transparent 100%);
  }
}

.header-title {
  padding: 0 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 2rpx;
}

/* 砍价操作（位于底部操作栏上方） */
.kj-buy-button {
  position: fixed;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  left: 0;
  z-index: 20;
  box-sizing: border-box;
  width: 100%;
  padding: 16rpx 24rpx;
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgb(0 0 0 / 5%);
}

/* 底部操作栏 */
.goods-action {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 20;
  box-sizing: border-box;
  display: flex;
  gap: 16rpx;
  width: 100%;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 16rpx rgb(0 0 0 / 5%);
}

.action-btn {
  flex: 1;
}

/* 规格弹窗 */
.popup-goods-card {
  display: flex;
  padding: 0 32rpx 32rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.popup-goods-image {
  flex-shrink: 0;
  width: 160rpx;
  height: 160rpx;
  margin-right: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgb(212 165 116 / 15%);
}

.popup-goods-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
}

.popup-goods-name {
  display: -webkit-box;
  margin-bottom: 12rpx;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #333;
  -webkit-box-orient: vertical;
}

.popup-price-row {
  display: flex;
  align-items: baseline;
}

.popup-current-price {
  margin-right: 12rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #c93636;
}

.popup-original-price {
  font-size: 26rpx;
  color: #c9935e;
  text-decoration: line-through;
}

.popup-spec-area {
  box-sizing: border-box;
  max-height: 600rpx;
  padding: 32rpx;
}

.popup-quantity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-top: 2rpx solid #f5f5f5;
}

.popup-quantity-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
}

.popup-action-area {
  padding: 24rpx 32rpx 32rpx;
}

.popup-confirm-btn {
  width: 100%;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 88rpx;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #c9935e 0%, #a87c4f 100%);
  border-radius: 44rpx;
  box-shadow: 0 8rpx 24rpx rgb(212 165 116 / 40%);

  &:active {
    transform: scale(0.96);
  }
}
</style>
