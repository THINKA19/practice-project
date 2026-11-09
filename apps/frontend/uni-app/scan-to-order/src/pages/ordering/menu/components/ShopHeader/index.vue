<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/ShopHeader/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import ShopHeader from '@/pages/ordering/menu/components/ShopHeader/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { PeisongType, Shop } from '@/pages/ordering/index'
import { convertShopPoint, distanceLine, ShopBusinessBadge, ShopFavorite, ShopLabels } from '@/pages/ordering/index'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { getLocation } from '../../adapters/platform.adapter'

/** 门店名称、履约方式与详情入口；距离仅使用本次有效定位计算。 */
const props = defineProps<{ shop: Shop | null, deliveryType?: PeisongType, dineIn?: boolean, tableCode?: string }>()
const emit = defineEmits<{ detail: [] }>()
const location = ref<{ latitude: number, longitude: number } | null>(null)
let attempted = false
let disposed = false
onScopeDispose(() => {
  disposed = true
})
function validPoint(point: { latitude?: unknown, longitude?: unknown } | null | undefined): point is { latitude: number, longitude: number } {
  return !!point && typeof point.latitude === 'number' && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && typeof point.longitude === 'number' && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180
}
watch(() => [props.dineIn, props.shop?.latitude, props.shop?.longitude], async () => {
  if (attempted || props.dineIn || !validPoint(props.shop))
    return
  attempted = true
  try {
    const point = await getLocation('wgs84')
    if (!disposed && validPoint(point))
      location.value = { latitude: point.latitude, longitude: point.longitude }
  }
  catch {
    // 定位失败或拒绝授权时隐藏距离，不阻断点餐，也不重复请求授权。
  }
}, { immediate: true })
const modeLabel = computed(() => props.dineIn ? '堂食' : props.deliveryType === 'kd' ? '外卖配送' : '到店自取')
const distanceText = computed(() => {
  if (props.dineIn || !validPoint(props.shop) || !validPoint(location.value))
    return ''
  const point = convertShopPoint(props.shop, props.shop.coordinateType, 'wgs84', props.shop.countryCode)
  const meters = distanceLine(location.value.latitude, location.value.longitude, point.latitude, point.longitude)
  if (!Number.isFinite(meters) || meters < 0)
    return ''
  return meters < 100 ? '直线距离不足 100 m' : `直线距离约 ${(meters / 1000).toFixed(1)} km`
})
</script>

<template>
  <view v-if="shop" class="shop-box">
    <view class="flex items-center justify-between gap-16rpx">
      <view class="min-w-0 flex flex-1 flex-wrap items-center gap-12rpx">
        <text class="shop-name">{{ shop.name }}</text>
        <ShopBusinessBadge :shop="shop" show-open />
      </view>
      <text class="shrink-0 rounded-8rpx bg-#F8F1E8 px-16rpx py-6rpx text-24rpx text-#8B5A3C">{{ modeLabel }}</text>
    </view>
    <view class="mt-16rpx">
      <ShopLabels :shop="shop" />
    </view>
    <view class="mt-20rpx flex items-center justify-between gap-16rpx border-t border-#F0EBE5 pt-16rpx">
      <view class="min-w-0 flex-1">
        <text v-if="dineIn" class="distance">{{ tableCode ? `桌号 ${tableCode}` : '已绑定当前桌台' }}</text>
        <text v-else-if="distanceText" class="distance">{{ distanceText }}</text>
      </view>
      <ShopFavorite :shop-id="shop.id" />
      <button
        class="detail-button m-0 shrink-0 border-0 bg-transparent p-0 text-24rpx text-#8B5A3C leading-40rpx"
        @tap.stop="emit('detail')"
      >
        查看门店详情 ›
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.shop-box {
  margin: 16rpx 24rpx;
  padding: 20rpx 24rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 18rpx rgb(65 43 21 / 7%);
}

.shop-name {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
  color: #2c2416;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.distance {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #999;
}

.detail-button::after {
  border: none;
}
</style>
