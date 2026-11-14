<script setup lang="ts">
import type { LocationMapProps } from './types'
// #ifdef H5
import { computed } from 'vue'
import { googleEmbedUrl } from '@/utils/project/map-preview'
import AmapLocationMap from './renderers/AmapLocationMap.vue'
import GoogleLocationMap from './renderers/GoogleLocationMap.vue'
import TencentLocationMap from './renderers/TencentLocationMap.vue'
// #endif
// #ifndef H5
import NativeLocationMap from './renderers/NativeLocationMap.vue'
// #endif

const props = defineProps<LocationMapProps>()

// #ifdef H5
const provider = computed(() => {
  const configured = props.provider ?? import.meta.env.VITE_LOCATION_MAP_PROVIDER
  return configured === 'amap' || configured === 'tencent' ? configured : 'google'
})
const source = computed(() => googleEmbedUrl({
  ...props.location,
  address: props.address,
  coordinateType: props.coordinateType,
  countryCode: props.countryCode,
}))
// #endif
</script>

<template>
  <view class="h-full min-h-0 w-full overflow-hidden bg-[#eeeae4]">
    <!-- #ifdef H5 -->
    <GoogleLocationMap v-if="provider === 'google'" :source="source" />
    <view v-else-if="!location" class="h-full flex items-center justify-center p-32rpx text-26rpx">
      暂无位置坐标
    </view>
    <AmapLocationMap v-else-if="provider === 'amap'" :location="location" :label="label" :coordinate-type="coordinateType" :country-code="countryCode" />
    <TencentLocationMap v-else :location="location" :coordinate-type="coordinateType" :country-code="countryCode" />
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <NativeLocationMap :location="location" :coordinate-type="coordinateType" :country-code="countryCode" :markers="markers" :suspended="suspended" />
    <!-- #endif -->
  </view>
</template>
