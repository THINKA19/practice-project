<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】门店位置页面组装；参数校验和复制地址由本领域流程持有。
 * 【方法与导出清单】页面默认组件：位置地图、地址复制和开始导航。
 * 【综合使用示例】import { ClientRoutes } from '@/pages/routes'; // 使用 Ordering.shopLocation 并携带 id 导航
 * ============================================================================
 */
import LocationMap from '@/components/location-map/index.vue'
import { PageState } from '@/components/page-state'
import { useShopLocationPage } from './composables/use-page'

definePage({ style: { navigationBarTitleText: '门店导航', disableScroll: true } })
const vm = useShopLocationPage()
const { shopInfo, location, markers, invalid, copyAddress, loading, error, navigationUrl, navigationVisible, navigationOptions, regionAddress, addressCopied } = vm
onHide(() => {
  vm.closeNavigation()
  vm.clearCopyFeedback()
})
const queryId = ref<string>()
onLoad((query) => {
  queryId.value = query?.id
  vm.init(query || {})
})
</script>

<template>
  <view class="location-page">
    <PageState v-if="invalid" status="empty" title="请先选择门店" />
    <view v-else-if="error" class="p-32rpx">
      <PageState status="error" :title="error" compact />
      <button @tap="vm.init({ id: queryId })">
        重新加载
      </button>
    </view>
    <PageState v-else-if="loading || !shopInfo" status="loading" title="正在加载门店位置" />
    <template v-else>
      <view class="location-info">
        <text class="location-name">{{ shopInfo.name }}</text>
        <text v-if="regionAddress" class="location-region mt-12rpx block text-26rpx text-[#777]">{{ regionAddress }}</text>
        <view class="mt-12rpx flex items-start gap-20rpx">
          <text class="location-address">{{ shopInfo.address || '门店暂未提供地址' }}</text>
          <button v-if="shopInfo.address" class="copy-address" size="mini" aria-label="复制门店地址" @tap="copyAddress">
            复制地址
          </button>
        </view>
      </view>
      <wd-popup v-if="addressCopied" :model-value="addressCopied" position="center" root-portal :modal="false" :duration="150" :z-index="1400" custom-style="padding: 10px 16px; border-radius: 8px; background: #e1f5e8; color: #16713d; box-shadow: 0 4px 16px #00000014; pointer-events: none;">
        <view class="flex items-center gap-8px text-14px leading-20px" role="status" aria-live="polite">
          <text class="text-16px font-600">✓</text>
          <text>地址复制成功</text>
        </view>
      </wd-popup>
      <view class="map-stage">
        <LocationMap :label="shopInfo.name" :address="shopInfo.address" :coordinate-type="shopInfo.coordinateType" :country-code="shopInfo.countryCode" :location="location" :markers="markers" :suspended="navigationVisible" />
      </view>
      <!-- #ifdef MP -->
      <wd-popup v-model="navigationVisible" position="bottom" root-portal round safe-area-inset-bottom :z-index="1300">
        <view class="px-32rpx pt-32rpx">
          <text class="mb-24rpx block text-center text-32rpx font-600">选择地图</text>
          <button v-for="option in navigationOptions" :key="option.id" class="map-option" @tap="vm.selectNavigation(option.id)">
            <text>{{ option.label }}</text>
            <!-- #ifndef H5 -->
            <text v-if="option.id !== 'native'" class="text-24rpx text-[#777]">复制链接到浏览器打开</text>
            <!-- #endif -->
          </button>
          <button class="map-cancel" @tap="vm.closeNavigation">
            取消
          </button>
        </view>
      </wd-popup>
      <!-- #endif -->
      <view class="location-actions">
        <button class="start-navigation" :disabled="!navigationUrl" @tap="vm.startNavigation">
          导航到店
        </button>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
.location-page {
  position: fixed;
  top: var(--window-top, 0px);
  right: 0;
  bottom: var(--window-bottom, 0px);
  left: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #faf7f2;
}
.location-info {
  flex-shrink: 0;
  max-height: 38%;
  overflow-y: auto;
  padding: 28rpx 32rpx;
  background: #fff;
}
.location-name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #39291e;
}
.location-address {
  display: block;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 26rpx;
  line-height: 1.5;
  color: #777;
}
.map-stage {
  flex: 1;
  min-height: 0;
}
.location-actions {
  display: flex;
  flex-shrink: 0;
  gap: 20rpx;
  padding: 24rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
}
.copy-address {
  flex-shrink: 0;
  margin: 0;
  color: #765235;
  background: #faf4ec;
}
.start-navigation {
  flex: 1;
  padding: 0;
  margin: 0;
  font-size: 28rpx;
  color: #fff;
  background: #b48a5c;
}
.map-option {
  display: flex;
  min-height: 100rpx;
  margin: 0 0 16rpx;
  padding: 16rpx 24rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  line-height: 1.5;
  color: #39291e;
  background: #faf7f2;
}
.map-cancel {
  margin: 24rpx 0;
  font-size: 28rpx;
  color: #777;
  background: #fff;
}
</style>
