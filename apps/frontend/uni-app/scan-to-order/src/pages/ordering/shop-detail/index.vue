<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】门店详情页面组装；业务流程由本领域 composables 持有。
 * 【方法与导出清单】页面默认组件：门店信息、电话、地址和地图展示。
 * 【综合使用示例】import { ClientRoutes } from '@/pages/routes'; // 使用 Ordering.shopDetail 并携带 id 导航
 * ============================================================================
 */
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import { ShopBusinessBadge, ShopFavorite, ShopLabels } from '@/pages/ordering/index'
import PhoneContact from '@/components/phone-contact/index.vue'
import { useShopDetailPage } from './composables/use-detail-page'
import { PageState } from '@/components/page-state'
import ShopPhotoGallery from './components/ShopPhotoGallery/index.vue'
import ShopImagePreview from './components/ShopImagePreview/index.vue'

definePage({
  style: {
    navigationBarTitleText: '',
  },
})

const { t } = useI18n()
const vm = useShopDetailPage()
const { shopInfo, loading, error, photos, services, introductionExpanded } = vm
const shopId = ref<string>()
const pageActive = ref(true)
const locationPreview = ref<InstanceType<typeof ShopImagePreview>>()
const locationPreviewing = ref(false)
const locationImageFailed = ref(false)
watch(() => [shopInfo.value?.id, shopInfo.value?.mapPreview], () => {
  locationImageFailed.value = false
  locationPreview.value?.close()
  locationPreviewing.value = false
})
function previewLocation() {
  const image = shopInfo.value?.mapPreview
  if (image && !locationImageFailed.value)
    locationPreview.value?.open({ images: [image], startPosition: 0 })
}
function locationOpened() {
  locationPreviewing.value = true
}
function locationClosed() {
  locationPreviewing.value = false
}
onShow(() => {
  pageActive.value = true
})
onHide(() => {
  pageActive.value = false
})
onLoad((query) => {
  shopId.value = query?.id
  vm.init(query as { id?: string })
})
</script>

<template>
  <view class="shop-detail-page">
    <PageState v-if="loading" status="loading" title="正在加载门店信息" />
    <view v-else-if="error" class="p-32rpx">
      <PageState status="error" :title="error" />
      <button v-if="shopId" @tap="vm.init({ id: shopId })">
        重新加载
      </button>
    </view>
    <template v-else-if="shopInfo">
      <view class="header-section">
        <ShopPhotoGallery v-if="photos.length" :key="shopInfo.id" :photos="photos" :active="pageActive && !locationPreviewing" />
        <view v-else class="h-full flex items-center justify-center text-28rpx text-gray-500">
          门店暂未上传照片
        </view>
        <view class="cover-overlay" />
      </view>

      <view class="shop-card">
        <view class="flex flex-col gap-20rpx">
          <view class="flex items-center justify-between gap-16rpx">
            <view class="min-w-0 flex flex-1 flex-wrap items-center gap-12rpx">
              <view class="shop-name">
                {{ shopInfo.name }}
              </view>
              <ShopBusinessBadge :shop="shopInfo" show-open />
            </view>
            <ShopFavorite :shop-id="shopInfo.id" />
          </view>
          <ShopLabels :shop="shopInfo" />
          <text v-if="shopInfo.openingHours" class="text-26rpx text-[#777]">营业时间 · {{ shopInfo.openingHours }}</text>
          <text v-if="photos.length" class="text-24rpx text-[#777]">{{ photos.length }} 张门店照片 · 点击查看大图</text>
          <view v-if="shopInfo?.characteristic" class="shop-tag">
            <text class="text-24rpx">
              ✨
            </text>
            <text class="tag-text">
              {{ shopInfo?.characteristic }}
            </text>
          </view>
        </view>
      </view>

      <view v-if="shopInfo.arrivalGuide || shopInfo.parkingInfo || shopInfo.notice" class="detail-section">
        <view class="detail-title">
          到店指引
        </view>
        <view v-if="shopInfo.arrivalGuide" class="mb-24rpx">
          <view class="mb-12rpx text-26rpx text-[#777]">
            入口与楼层
          </view>
          <view class="introduction">
            {{ shopInfo.arrivalGuide }}
          </view>
        </view>
        <view v-if="shopInfo.parkingInfo" class="mb-24rpx">
          <view class="mb-12rpx text-26rpx text-[#777]">
            停车信息
          </view>
          <view class="introduction">
            {{ shopInfo.parkingInfo }}
          </view>
        </view>
        <view v-if="shopInfo.notice">
          <view class="mb-12rpx text-26rpx text-[#777]">
            到店须知
          </view>
          <view class="introduction">
            {{ shopInfo.notice }}
          </view>
        </view>
      </view>

      <view class="action-buttons">
        <PhoneContact
          :phone="shopInfo?.linkPhone"
          title="联系门店"
          description="请复制门店电话号码，使用手机拨打联系门店。"
          unavailable-message="门店暂未提供联系电话"
        >
          <template #trigger="{ open }">
            <view class="action-btn" @tap.stop="open">
              <view class="btn-icon">
                📞
              </view>
              <view class="btn-text">
                {{ t('shop.contactUs') }}
              </view>
              <view class="btn-sub-text">
                {{ shopInfo?.linkPhone || '暂未提供联系电话' }}
              </view>
            </view>
          </template>
        </PhoneContact>
        <view class="action-divider" />
        <view class="action-btn" @tap="vm.guideNow()">
          <view class="btn-icon">
            🧭
          </view>
          <view class="btn-text">
            {{ t('shop.Navigation') }}
          </view>
          <view class="btn-sub-text">
            {{ t('shop.viewMap') }}
          </view>
        </view>
      </view>

      <view class="detail-section">
        <view class="detail-title">
          门店信息
        </view>
        <view class="info-item">
          <view class="info-label">
            <text class="text-28rpx">
              🕐
            </text>
            <text>{{ t('shop.openingHours') }}</text>
          </view>
          <view class="info-value">
            {{ shopInfo?.openingHours || '营业时间待补充' }}
          </view>
        </view>
        <view class="info-item info-item-last">
          <view class="info-label">
            <text class="text-28rpx">
              📍
            </text>
            <text>门店地址</text>
          </view>
          <view class="info-value">
            {{ shopInfo?.address || '门店暂未提供地址' }}
          </view>
        </view>
      </view>

      <view v-if="services.length" class="detail-section">
        <view class="detail-title">
          服务与设施
        </view>
        <view class="flex flex-wrap gap-16rpx">
          <text v-for="service in services" :key="service" class="rounded-12rpx bg-[#faf4ec] px-20rpx py-12rpx text-26rpx text-[#765235]">{{ service }}</text>
        </view>
      </view>
      <view v-if="shopInfo?.introduce" class="detail-section">
        <view class="detail-title">
          门店介绍
        </view>
        <view class="introduction" :class="{ 'introduction-collapsed': !introductionExpanded && shopInfo.introduce.length > 100 }">
          {{ shopInfo.introduce }}
        </view>
        <button v-if="shopInfo.introduce.length > 100" class="expand-button" @tap="introductionExpanded = !introductionExpanded">
          {{ introductionExpanded ? '收起介绍' : '展开全文' }}
        </button>
      </view>

      <view class="map-section">
        <view class="map-header">
          <text class="map-title">
            📌 门店位置
          </text>
          <view class="map-tip" @tap="vm.guideNow()">
            <text>点击导航</text>
            <text>&gt;</text>
          </view>
        </view>
        <image v-if="shopInfo.mapPreview && !locationImageFailed" class="h-360rpx w-full" :src="shopInfo.mapPreview" mode="aspectFit" @tap="previewLocation" @error="locationImageFailed = true" />
        <view v-else class="p-32rpx text-28rpx text-[#777]">
          {{ locationImageFailed ? '位置图片加载失败，请联系门店确认位置' : '门店暂未上传位置图片' }}
        </view>
      </view>
      <ShopImagePreview :key="shopInfo.id" ref="locationPreview" @open="locationOpened" @close="locationClosed" />
      <view class="h-40rpx" />
    </template>
  </view>
</template>

<style lang="scss" scoped>
.shop-detail-page {
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  min-height: 100vh;
  background: linear-gradient(180deg, #fff8f0 0%, #fff 100%);
}

.header-section {
  position: relative;
  width: 100%;
  height: 500rpx;
  overflow: hidden;
}

.cover-overlay {
  pointer-events: none;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 150rpx;
  background: linear-gradient(to bottom, rgb(255 255 255 / 0%) 0%, rgb(255 255 255 / 90%) 100%);
}

%card {
  margin: 0 30rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgb(210 180 140 / 15%);
}

.shop-card {
  @extend %card;

  position: relative;
  padding: 40rpx 32rpx;
  margin-top: -80rpx;
}

.shop-name {
  font-size: 40rpx;
  font-weight: 600;
  line-height: 56rpx;
  color: #3d2817;
}

.shop-tag {
  display: inline-flex;
  gap: 8rpx;
  align-items: center;
  align-self: flex-start;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #ffe8d1 0%, #ffd4a8 100%);
  border-radius: 50rpx;
}

.tag-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #8b5a2b;
}

.action-buttons {
  @extend %card;

  display: flex;
  align-items: center;
  padding: 32rpx;
}

.action-btn {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12rpx;
  align-items: center;
  padding: 16rpx 0;
}

.btn-icon {
  margin-bottom: 8rpx;
  font-size: 48rpx;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #3d2817;
}

.btn-sub-text {
  max-width: 240rpx;
  margin-top: 4rpx;
  overflow: hidden;
  font-size: 22rpx;
  color: #999;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-divider {
  flex: 0 0 1px;
  height: 104rpx;
  margin: 0 24rpx;
  background: #eadbca;
  border-radius: 1px;
}

.detail-section {
  @extend %card;

  padding: 40rpx 32rpx;
}

.detail-title {
  padding-bottom: 24rpx;
  margin-bottom: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #3d2817;
  border-bottom: 2rpx solid #f5f5f5;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.info-item-last {
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  display: flex;
  gap: 12rpx;
  align-items: center;
  font-size: 26rpx;
  font-weight: 500;
  color: #666;
}

.info-value {
  padding-left: 40rpx;
  font-size: 28rpx;
  line-height: 44rpx;
  color: #333;
}

.map-section {
  @extend %card;

  overflow: hidden;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: linear-gradient(135deg, #fff8f0 0%, #fff 100%);
}

.map-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #3d2817;
}

.map-tip {
  display: flex;
  gap: 8rpx;
  align-items: center;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #d2691e;
  background: rgb(255 228 196 / 50%);
  border-radius: 20rpx;
}

.introduction {
  font-size: 28rpx;
  line-height: 1.8;
  color: #444;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.introduction-collapsed {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}
.expand-button {
  padding: 16rpx 0 0;
  margin: 0;
  font-size: 26rpx;
  line-height: 1.5;
  color: #936338;
  text-align: left;
  background: transparent;
  &::after {
    border: 0;
  }
}
</style>
