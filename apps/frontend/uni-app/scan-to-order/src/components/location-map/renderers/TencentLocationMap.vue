<script setup lang="ts">
import type { SdkLocationMapProps } from '../types'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import PageLoading from '@/components/page-loading/index.vue'
import { convertMapPoint } from '@/utils/project/map-coordinates'
import { loadTencentMap } from '../adapters/tencent-loader'

const props = defineProps<SdkLocationMapProps>()
const container = ref<HTMLElement>()
const key = String(import.meta.env.VITE_TENCENT_MAP_JS_KEY || '').trim()
const loading = ref(false)
const failed = ref(false)
const zoom = 16
const center = computed(() => convertMapPoint(props.location, props.coordinateType, 'gcj02', props.countryCode))
let version = 0
let disposeMap: (() => void) | undefined
let recenter: (() => void) | undefined
let timer: ReturnType<typeof setTimeout> | undefined

function dispose() {
  clearTimeout(timer)
  disposeMap?.()
  disposeMap = undefined
  recenter = undefined
}

async function renderMap() {
  const current = ++version
  dispose()
  failed.value = false
  loading.value = !!key
  if (!key)
    return

  function fail() {
    if (current !== version)
      return
    version++
    loading.value = false
    failed.value = true
    dispose()
  }

  try {
    await nextTick()
    const api = await loadTencentMap(key)
    if (current !== version || !container.value)
      return

    const position = new api.LatLng(center.value.latitude, center.value.longitude)
    const map = new api.Map(container.value, { center: position, zoom, pitch: 0 })
    disposeMap = () => map.destroy()
    timer = setTimeout(fail, 20000)
    map.on('tilesloaded', () => {
      if (current !== version)
        return
      clearTimeout(timer)
      loading.value = false
    })

    const marker = new api.MultiMarker({ map, geometries: [{ id: 'location', position }] })
    disposeMap = () => {
      try {
        marker.setMap(null)
      }
      finally {
        map.destroy()
      }
    }
    recenter = () => {
      map.setCenter(position)
      map.setZoom(zoom)
    }
  }
  catch {
    fail()
  }
}

watch(center, renderMap, { immediate: true, flush: 'post' })
onBeforeUnmount(() => {
  version++
  dispose()
})
</script>

<template>
  <view class="relative h-full w-full">
    <div v-show="key && !failed" ref="container" class="h-full w-full" aria-label="腾讯位置地图" />
    <view v-if="!key || failed" class="h-full flex flex-col items-center justify-center gap-24rpx p-32rpx text-center text-28rpx">
      <text>{{ key ? '腾讯地图暂时无法显示' : '腾讯地图暂未启用' }}</text>
      <button v-if="key" size="mini" @tap="renderMap">
        重试地图
      </button>
    </view>
    <view v-else-if="loading" class="absolute bottom-24rpx left-24rpx bg-white p-12rpx">
      <PageLoading inline title="正在加载腾讯地图…" />
    </view>
    <view v-else class="absolute right-24rpx top-24rpx">
      <button size="mini" @tap="recenter?.()">
        回到标记位置
      </button>
    </view>
  </view>
</template>
