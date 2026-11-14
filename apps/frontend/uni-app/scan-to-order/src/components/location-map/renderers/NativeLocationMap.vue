<script setup lang="ts">
import type { LocationMapProps } from '../types'
import { computed, ref, watch } from 'vue'
import { convertMapPoint } from '@/utils/project/map-coordinates'

const props = defineProps<LocationMapProps>()

const revision = ref(0)
const failed = ref(false)
const nativePoint = computed(() => props.location ? convertMapPoint(props.location, props.coordinateType, 'gcj02', props.countryCode) : null)
const nativeMarkers = computed(() => (props.markers ?? []).map(marker => ({
  ...marker,
  ...convertMapPoint(marker, props.coordinateType, 'gcj02', props.countryCode),
})))

function fail() {
  failed.value = true
}

function resetMap() {
  failed.value = false
  revision.value++
}

watch(nativePoint, resetMap)
</script>

<template>
  <view class="location-map">
    <view v-if="!nativePoint" class="map-empty">
      <text>暂无位置坐标</text>
    </view>
    <template v-else>
      <view v-if="failed" class="map-empty">
        <text>内置地图暂时无法显示</text>
        <button size="mini" @tap="resetMap">
          重试地图
        </button>
      </view>
      <map v-else-if="!suspended" :key="revision" class="map-container" :latitude="nativePoint.latitude" :longitude="nativePoint.longitude" :markers="nativeMarkers" :scale="16" enable-zoom enable-scroll show-compass @error="fail" />
      <view v-if="!failed && !suspended" class="map-tools">
        <button size="mini" @tap="resetMap">
          回到标记位置
        </button>
        <button size="mini" @tap="fail">
          地图未显示？
        </button>
      </view>
    </template>
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
.map-tools {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
</style>
