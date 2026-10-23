<!--
============================================================================
【文件概述】首页展示层，保持轮播、用户卡、配送和服务入口布局。
【方法与导出清单】默认 Vue 组件；生命周期调用 usePage。
【综合使用示例】
import { ClientRoutes } from '@/pages/routes'
uni.switchTab({ url: ClientRoutes.Home.home }) // 打开首页
============================================================================
-->
<script setup lang="ts">
/**
 * 首页（tab）：Banner、用户卡、配送方式入口、更多服务、分享
 */
import { useI18n } from 'vue-i18n'
import HomeUserCard from './components/HomeUserCard.vue'
import { usePage } from './composables/usePage'

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTextStyle: 'white',
    disableScroll: true,
  },
})

const { t } = useI18n()
const vm = usePage()
const { banners, nick, avatar, levelName } = vm
/** wd-swiper 数据（value 为图片地址） */
const swiperList = computed(() => banners.value.map(b => ({ value: b.picUrl, linkUrl: b.linkUrl })))

onLoad(() => {
  vm.init()
})

onShow(() => {
  vm.refresh()
})

onShareAppMessage(() => vm.shareAppMessage())

onShareTimeline(() => vm.shareTimeline())
</script>

<template>
  <z-paging
    fixed
    :paging-style="{ background: 'linear-gradient(180deg, #fef8f4 0%, #fff5ed 100%)' }"
    :use-page-scroll="false"
    :auto="false"
    :hide-empty-view="true"
    :refresher-enabled="false"
    :loading-more-enabled="false"
  >
    <view class="home-container">
      <!-- 轮播图 -->
      <view class="relative w-full overflow-hidden">
        <wd-swiper
          v-if="banners.length"
          :list="swiperList"
          height="230"
          autoplay
          loop
          custom-class="banner-swiper"
          @click="({ item }) => vm.tapBanner((item as { linkUrl?: string }).linkUrl)"
        />
      </view>

      <!-- 用户信息卡片 -->
      <HomeUserCard
        :avatar="avatar"
        :nick="nick"
        :level-name="levelName"
        @member="vm.openMemberCenter"
        @coupon="vm.openCoupons"
      />

      <!-- 配送方式 -->
      <view class="mx-32rpx mt-40rpx">
        <view class="section-title">
          {{ t('home.delivery.title') }}
        </view>
        <view class="flex gap-24rpx">
          <view class="delivery-card" @tap="vm.openShopSelection('zq')">
            <view class="delivery-icon-wrapper">
              <view class="i-carbon-store text-48rpx text-#a67c52" />
            </view>
            <view class="mb-8rpx text-30rpx text-#333 font-600">
              {{ t('home.delivery.pickup') }}
            </view>
            <view class="text-24rpx text-#999">
              {{ t('home.delivery.pickupDescription') }}
            </view>
          </view>
          <view class="delivery-card" @tap="vm.openShopSelection('kd')">
            <view class="delivery-icon-wrapper">
              <view class="i-carbon-delivery text-48rpx text-#a67c52" />
            </view>
            <view class="mb-8rpx text-30rpx text-#333 font-600">
              {{ t('home.delivery.takeout') }}
            </view>
            <view class="text-24rpx text-#999">
              {{ t('home.delivery.takeoutDescription') }}
            </view>
          </view>
        </view>
      </view>

      <!-- 更多服务 -->
      <view class="mx-32rpx mt-48rpx">
        <view class="section-title">
          {{ t('home.features.title') }}
        </view>
        <view class="features-grid">
          <view class="feature-item" @tap="vm.openFavorites">
            <view class="feature-icon-box">
              <view class="i-carbon-favorite text-48rpx text-#a67c52" />
            </view>
            <view class="feature-name">
              {{ t('home.features.favorites') }}
            </view>
          </view>
          <view class="feature-item" @tap="vm.openMemberCard">
            <view class="feature-icon-box">
              <view class="i-carbon-wallet text-48rpx text-#a67c52" />
            </view>
            <view class="feature-name">
              {{ t('home.features.memberCard') }}
            </view>
          </view>
          <view class="feature-item" @tap="vm.openGroupBuying">
            <view class="feature-icon-box">
              <view class="i-carbon-group text-48rpx text-#a67c52" />
            </view>
            <view class="feature-name">
              {{ t('home.features.groupBuy') }}
            </view>
          </view>
          <view class="feature-item" @tap="vm.openWelfare">
            <view class="feature-icon-box">
              <view class="i-carbon-gift text-48rpx text-#a67c52" />
            </view>
            <view class="feature-name">
              {{ t('home.features.welfare') }}
            </view>
          </view>
        </view>
      </view>

      <!-- 品牌底部 -->
      <view class="mt-64rpx flex items-center justify-center gap-24rpx px-64rpx" @tap="vm.openAbout">
        <view class="brand-line" />
        <view class="brand-name">
          TEA WORK
        </view>
        <view class="brand-line" />
      </view>
    </view>
  </z-paging>
</template>

<style lang="scss" scoped>
.home-container {
  padding-bottom: 60rpx;
}

:deep(.banner-swiper) {
  overflow: hidden;
  border-radius: 0 0 48rpx 48rpx;
}

.section-title {
  padding-left: 12rpx;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  border-left: 6rpx solid #ff6b9d;
}

.delivery-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 24rpx;
  background: linear-gradient(135deg, #fff 0%, #fffbf8 100%);
  border: 2rpx solid #ffe8f0;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgb(255 141 107 / 8%);
}

.delivery-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 16rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe8f0 100%);
  border-radius: 50%;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 12rpx;
  background: linear-gradient(135deg, #fff 0%, #fffbf8 100%);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgb(255 141 107 / 6%);
}

.feature-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 12rpx;
  background: linear-gradient(135deg, #fff5f0 0%, #ffebe8 100%);
  border-radius: 50%;
}

.feature-name {
  font-size: 24rpx;
  line-height: 1.4;
  color: #666;
  text-align: center;
}

.brand-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #e8d5c8 50%, transparent 100%);
}

.brand-name {
  font-family: Georgia, serif;
  font-size: 28rpx;
  font-weight: 600;
  color: #a67c52;
  letter-spacing: 4rpx;
}
</style>
