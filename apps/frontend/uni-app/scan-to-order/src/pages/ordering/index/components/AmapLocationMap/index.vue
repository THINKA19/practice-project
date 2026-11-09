<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / components/AmapLocationMap/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import AmapLocationMap from '@/pages/ordering/index/components/AmapLocationMap/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/** H5 高德世界地图：配置、网络、权限失败不影响地址复制和外部导航。 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Shop } from '../../models/types'
import type { AmapInstance } from '../../adapters/amap-loader'
import { loadAmap } from '../../adapters/amap-loader'
import { convertShopPoint } from '../../models/coordinates'

const props = defineProps<{ shop: Shop | null, location: { latitude: number, longitude: number } }>()
const container = ref<HTMLElement>()
const key = String(import.meta.env.VITE_AMAP_JS_KEY || '').trim()
const securityCode = String(import.meta.env.VITE_AMAP_SECURITY_JS_CODE || '').trim()
const configured = !!key && !!securityCode
const loading = ref(false)
const failed = ref(false)
const center = computed(() => {
  const point = convertShopPoint(props.location, props.shop?.coordinateType, 'gcj02', props.shop?.countryCode)
  return [point.longitude, point.latitude]
})
let map: AmapInstance | undefined
let version = 0
let timeout: ReturnType<typeof setTimeout> | undefined
function dispose() {
  if (timeout)
    clearTimeout(timeout)
  timeout = undefined
  map?.destroy()
  map = undefined
}
async function renderMap() {
  const current = ++version
  dispose()
  failed.value = false
  loading.value = configured
  if (!configured)
    return
  try {
    await nextTick()
    const api = await loadAmap(key, securityCode)
    if (current !== version || !container.value)
      return
    map = new api.Map(container.value, { center: center.value, zoom: 16, lang: 'zh_cn' })
    const fail = () => {
      if (current !== version)
        return
      failed.value = true
      loading.value = false
      dispose()
    }
    timeout = setTimeout(fail, 20000)
    map.on('error', fail)
    map.on('complete', () => {
      if (current !== version)
        return
      if (timeout)
        clearTimeout(timeout)
      timeout = undefined
      loading.value = false
    })
    map.add(new api.Marker({ position: center.value, title: props.shop?.name || '门店' }))
  }
  catch {
    if (current === version) {
      failed.value = true
      loading.value = false
      dispose()
    }
  }
}
function resetMap() {
  map?.setZoomAndCenter(16, center.value)
}
watch(() => [props.shop?.id, ...center.value], renderMap, { immediate: true, flush: 'post' })
onBeforeUnmount(() => {
  version++
  dispose()
})
</script>

<template>
  <view class="relative h-full w-full">
    <div v-show="configured && !failed" ref="container" class="h-full w-full" aria-label="高德门店位置地图" />
    <view v-if="!configured || failed" class="h-full flex flex-col items-center justify-center gap-24rpx p-32rpx text-center text-28rpx text-[#665647]">
      <text>{{ configured ? '高德地图暂时无法显示' : '门店地图暂未启用' }}</text>
      <text class="text-24rpx">可使用下方导航到店，或复制门店地址。</text>
      <button v-if="configured" size="mini" @tap="renderMap">
        重试地图
      </button>
    </view>
    <view v-else class="absolute right-24rpx top-24rpx">
      <button size="mini" @tap="resetMap">
        回到门店
      </button>
    </view>
    <text v-if="loading" class="absolute bottom-24rpx left-24rpx bg-white p-12rpx text-24rpx">正在加载高德地图…</text>
  </view>
</template>
