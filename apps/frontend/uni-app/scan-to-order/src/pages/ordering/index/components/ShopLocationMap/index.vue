<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / components/ShopLocationMap/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import ShopLocationMap from '@/pages/ordering/index/components/ShopLocationMap/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/** 位置页地图：H5 使用 Google 网页嵌入地图；原生端使用平台地图，不以图片替代失败地图。 */
import type { MapMarker, Shop } from '../../models/types'
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import { convertShopPoint } from '../../models/coordinates'
// #ifdef H5
import GoogleLocationMap from '../GoogleLocationMap/index.vue'
// #endif

const props = defineProps<{
  shop: Shop | null
  location: { latitude: number, longitude: number } | null
  markers: MapMarker[]
  suspended?: boolean
}>()
const revision = ref(0)
const failed = ref(false)
const instance = getCurrentInstance()
const nativePoint = computed(() => props.location ? convertShopPoint(props.location, props.shop?.coordinateType, 'gcj02', props.shop?.countryCode) : null)
const nativeMarkers = computed(() => nativePoint.value ? props.markers.map(marker => ({ ...marker, ...nativePoint.value })) : [])
function fail() {
  failed.value = true
}
watch(() => props.shop?.id, () => {
  failed.value = false
})
async function resetMap() {
  failed.value = false
  revision.value++
  // #ifndef H5
  await nextTick()
  if (nativePoint.value)
    uni.createMapContext('shop-location-map', instance?.proxy ?? undefined).moveToLocation(nativePoint.value)
  // #endif
}
</script>

<template>
  <view class="location-map">
    <!-- #ifdef H5 -->
    <GoogleLocationMap :shop="shop" />
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <view v-if="!location" class="map-empty">
      <text>门店暂未提供位置坐标</text>
      <text class="map-description">可复制地址，在地图中搜索门店。</text>
    </view>
    <template v-else>
      <view v-if="failed" class="map-empty">
        <text>内置地图暂时无法显示</text>
        <text class="map-description">可使用下方导航到店，或复制门店地址。</text>
        <button size="mini" @tap="resetMap">
          重试地图
        </button>
      </view>
      <map v-else-if="nativePoint && !suspended" id="shop-location-map" :key="revision" class="map-container" :latitude="nativePoint.latitude" :longitude="nativePoint.longitude" :markers="nativeMarkers" :scale="16" enable-zoom enable-scroll show-compass @error="fail" />
      <view v-if="!failed" class="map-tools">
        <button size="mini" @tap="resetMap">
          回到门店
        </button>
        <button size="mini" @tap="fail">
          地图未显示？
        </button>
      </view>
    </template>
    <!-- #endif -->
  </view>
</template>

<style scoped lang="scss">
.location-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #eeeae4;
}
.map-container {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
.map-empty {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  padding: 32rpx;
  flex-direction: column;
  gap: 24rpx;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 28rpx;
  color: #665647;
}
.map-description {
  font-size: 24rpx;
  line-height: 1.7;
}
.map-tools {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.map-status {
  position: absolute;
  bottom: 24rpx;
  left: 24rpx;
  padding: 12rpx;
  font-size: 24rpx;
  background: #fff;
}
</style>
