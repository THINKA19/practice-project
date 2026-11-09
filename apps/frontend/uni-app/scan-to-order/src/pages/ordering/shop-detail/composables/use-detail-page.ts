/**
 * ============================================================================
 * 【文件概述】门店详情领域的页面流程；通过门店公开 API 读取快照，编排电话与导航。
 * 【方法与导出清单】useShopDetailPage：独立实例的门店详情、地图数据和页面动作。
 * 【综合使用示例】import { useShopDetailPage } from '@/pages/ordering/shop-detail'; const vm = useShopDetailPage(); vm.init({ id: '1' })
 * ============================================================================
 */
import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'
import type { MapMarker, Shop, ShopDetail } from '@/pages/ordering/index'
import { convertShopPoint, googleEmbedUrl, googleNavigationUrl, shopApi, toShopDetail, useShopPhoneContact } from '@/pages/ordering/index'
import { alert, setTitle } from '@/utils/project/interaction'
import { openLink, openLocation } from '@/pages/ordering/menu'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

/**
 * 管理门店详情快照、联系电话与导航操作。
 * @returns 页面独立的门店数据、地图展示数据及初始化/交互方法；无参数。
 * @example const vm = useShopDetailPage(); await vm.init({ id: '1' }) // => 加载指定门店
 */
export function useShopDetailPage() {
  const detail = ref<ShopDetail | null>(null)

  const shopInfo = ref<Shop | null>(null)
  const loading = ref(false)
  const error = ref('')
  let requestVersion = 0
  if (getCurrentScope()) {
    onScopeDispose(() => {
      requestVersion++
    })
  }
  const introductionExpanded = ref(false)
  const photos = computed(() => [...new Set([shopInfo.value?.pic, ...(shopInfo.value?.photos || [])]
    .filter((url): url is string => typeof url === 'string' && !!url.trim()))])
  const services = computed(() => (shopInfo.value?.services || [])
    .filter((name): name is string => typeof name === 'string' && !!name.trim()))

  /** 预览当前门店相册。@param current 当前照片。@returns void。@example previewPhoto(photos.value[0]) */
  function previewPhoto(current: string) {
    if (photos.value.includes(current))
      uni.previewImage({ current, urls: photos.value })
  }

  const markers = ref<MapMarker[]>([])
  const location = computed(() => {
    const s = shopInfo.value
    if (s?.latitude == null || s.longitude == null)
      return null
    const latitude = Number(s.latitude)
    const longitude = Number(s.longitude)
    return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 ? { latitude, longitude } : null
  })
  const mapUrl = computed(() => {
    return googleEmbedUrl(shopInfo.value)
  })

  async function init(query: { id?: string } = {}) {
    if (!query.id || !Number.isInteger(Number(query.id)) || Number(query.id) <= 0) {
      requestVersion++
      loading.value = false
      shopInfo.value = null
      detail.value = null
      markers.value = []
      introductionExpanded.value = false
      error.value = '请先选择门店'
      return
    }

    await shopSubdetail(query.id)
  }

  async function shopSubdetail(id: string) {
    const version = ++requestVersion
    loading.value = true
    error.value = ''
    shopInfo.value = null
    detail.value = null
    markers.value = []
    introductionExpanded.value = false
    try {
      const res = await shopApi.detail(id).then(toShopDetail)
      if (version !== requestVersion)
        return

      setTitle(res.info.name)

      detail.value = res

      shopInfo.value = res.info

      markers.value = location.value
        ? [{
            id: 0,
            latitude: Number(res.info.latitude),
            longitude: Number(res.info.longitude),
            iconPath: '/static/images/ordering/map-pin.png',
            height: 40,
            width: 30,
          }]
        : []
    }
    catch (e) {
      if (version === requestVersion)
        error.value = (e as Error)?.message || '门店信息加载失败，请重试'
    }
    finally {
      if (version === requestVersion)
        loading.value = false
    }
  }

  const phoneContact = useShopPhoneContact(() => shopInfo.value?.linkPhone)
  const phoneCall = phoneContact.open

  function guideNow() {
    if (!shopInfo.value) {
      return
    }
    void navigate(ClientRoutes.Ordering.shopLocation, { id: shopInfo.value.id })
  }

  function startNavigation() {
    const s = shopInfo.value

    if (!s || !location.value) {
      void alert('门店暂未提供有效的位置坐标')
      return
    }

    // #ifdef H5
    openLink(googleNavigationUrl(s))
    // #endif
    // #ifndef H5
    const nativePoint = convertShopPoint(location.value, s.coordinateType, 'gcj02', s.countryCode)
    openLocation({
      name: s.name,
      address: s.address,
      ...nativePoint,
      fail: () => { void alert('暂时无法打开地图，请复制地址到地图中搜索') },
    })
    // #endif
  }

  return { detail, shopInfo, markers, location, mapUrl, loading, error, photos, services, introductionExpanded, previewPhoto, init, phoneContact, phoneCall, guideNow, startNavigation }
}
