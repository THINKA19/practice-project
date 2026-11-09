import { promotionExpiresAt } from '../domain/promotion.rules'
/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / composables/use-select-page.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - ShopPaging：数据类型契约。
 * - useShopSelectPage：本文件对外声明。
 * 【综合使用示例】
 * import type { ShopPaging } from '@/pages/ordering/index/composables/use-select-page'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
import type { ShopRegion, ShopRegionSelection } from '../models/regions'
import type { Shop, ShopCategory } from '../models/types'
import { toShop } from '../models/mappers'
import { useShopFavorites } from '../favorites'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import { formatDistance, shopCheckoutReason } from '../domain/shop.rules'
import { normalizeRegionSelection, toShopRegions } from '../models/region-mappers'
import { shopApi } from '../api/shop.api'
import { useShopStore } from '../store'
import { takeShopSelectionTarget } from '../navigation'
import { setTitle } from '@/utils/project/interaction'
import { navigate as go } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

/**
 * ShopPaging 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：reload、complete、scrollToY；必填与可选字段见声明。
 * @example
 * import type { ShopPaging } from '@/pages/ordering/index/composables/use-select-page'
 * declare const response: ShopPaging
 * const value: ShopPaging = response // => 保留 ShopPaging 的字段与取值约束
 */
export interface ShopPaging {
  reload: () => Promise<unknown>
  refresh: () => Promise<unknown>
  complete: (rows: Shop[] | false) => Promise<unknown>
  scrollToY?: (top: number, offset?: number, animate?: boolean) => void
}

/**
 * 每页六条；地区联动和防抖搜索均从第一页重新请求。
 * @returns 对象，包含 paging、shops、searchValue、countryCode、cityCode、districtCode、regionLabel、selectedShopId、rememberScroll、restorePosition、init、query、reload、resetFilters、searchChange、applyRegion、goShop。
 * @example
 * import { useShopSelectPage } from '@/pages/ordering/index/composables/use-select-page'
 * useShopSelectPage() // => 对象，包含 paging、shops、searchValue、countryCode、cityCode、districtCode、regionLabel、selectedShopId、rememberScroll、restorePosition、init、query、reload、resetFilters、searchChange、applyRegion、goShop
 */
export function useShopSelectPage(capability?: 'table-booking') {
  const { t } = useI18n()
  const shopStore = useShopStore()
  const paging = ref<ShopPaging>()
  const shops = ref<Shop[]>([])
  const category = ref<ShopCategory>('all')
  const favorites = useShopFavorites()
  const session = useSessionState()
  const favoritesNeedLogin = computed(() => category.value === 'favorites' && (!session.hasLogin || session.identity !== 'customer'))
  const emptyText = computed(() => favoritesNeedLogin.value ? '登录后查看收藏门店' : category.value === 'favorites' ? '当前筛选条件下暂无收藏门店' : category.value === 'promotions' ? '当前地区暂无优惠活动，试试其他地区' : '没有找到门店，试试其他关键词或地区')
  const searchValue = ref('')
  const countryCode = ref('')
  const cityCode = ref('')
  const districtCode = ref('')
  const regions = ref<ShopRegion[]>([])
  const regionsLoading = ref(false)
  const regionsError = ref('')
  const regionsReady = ref(false)
  let regionsVersion = 0
  const type = ref('')
  const selectedShopId = computed(() => shopStore.current?.id)
  let scrollTop = 0
  let returnScrollTop: number | undefined
  let refreshing = false
  let querying = false
  let visible = true

  function rememberScroll(top: number) {
    scrollTop = top
  }

  function restorePosition() {
    if (returnScrollTop === undefined || !visible || querying || refreshing || !paging.value?.scrollToY)
      return
    paging.value.scrollToY(returnScrollTop, 0, false)
    scrollTop = returnScrollTop
    returnScrollTop = undefined
  }
  const regionLabel = computed(() => {
    const country = regions.value.find(item => item.code === countryCode.value)
    const city = country?.cities.find(item => item.code === cityCode.value)
    const district = city?.districts.find(item => item.code === districtCode.value)
    return district?.name ?? city?.name ?? country?.name ?? '地区'
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  let revision = 0
  let disposed = false
  let promotionTimer: ReturnType<typeof setTimeout> | undefined
  let promotionDeadline = Number.POSITIVE_INFINITY
  /** 活动列表仅在可见时刷新，避免过期卡片长期留在优惠入口。@param value 页面是否可见。@returns void。@example setVisible(false) // => 清理活动刷新 */
  function setVisible(value: boolean) {
    visible = value
    clearTimeout(promotionTimer)
    if (value && category.value === 'promotions')
      refreshKeepingPosition()
  }
  watch(() => session.sessionRevision, () => {
    reload()
    void favorites.load()
  }, { flush: 'sync' })
  watch(() => favorites.ids, () => {
    if (category.value === 'favorites')
      refreshKeepingPosition()
  })

  // refresh 保留已加载页数；返回时不清空列表，等数据和视图就绪再恢复位置。
  function refreshKeepingPosition() {
    if (refreshing || disposed || !paging.value)
      return
    returnScrollTop ??= scrollTop
    refreshing = true
    clearTimeout(promotionTimer)
    promotionDeadline = Number.POSITIVE_INFINITY
    void paging.value.refresh().catch(() => {}).finally(async () => {
      refreshing = false
      await nextTick()
      if (!disposed)
        restorePosition()
    })
  }

  /** 切换分类，未登录的收藏只展示引导，登录由用户主动触发。 */
  function changeCategory(value: ShopCategory) {
    if (category.value === value)
      return
    category.value = value
    paging.value?.scrollToY?.(0, 0, false)
    reload()
  }

  function loginForFavorites() {
    requireIdentity('customer')
  }

  /** 每次打开选择器重新读取开放范围；旧请求与卸载后响应不生效。无参数。@returns Promise<void>。@example await loadRegions() */
  async function loadRegions() {
    const ticket = ++regionsVersion
    regionsLoading.value = true
    regionsError.value = ''
    regionsReady.value = false
    try {
      const next = toShopRegions(await shopApi.regions())
      if (disposed || ticket !== regionsVersion)
        return
      regions.value = next
      regionsReady.value = true
      regionsLoading.value = false
      const previous = { countryCode: countryCode.value, cityCode: cityCode.value, districtCode: districtCode.value }
      const selection = normalizeRegionSelection(next, previous)
      if (JSON.stringify(previous) !== JSON.stringify(selection))
        applyRegion(selection)
    }
    catch {
      if (!disposed && ticket === regionsVersion) {
        regions.value = []
        regionsError.value = '地区加载失败，请重试'
      }
    }
    finally {
      if (!disposed && ticket === regionsVersion)
        regionsLoading.value = false
    }
  }

  function init(query: { type?: string, peisongType?: string } = {}) {
    setTitle(t('shop.select'))
    type.value = query.type || ''
    if (query.peisongType === 'zq' || query.peisongType === 'kd')
      shopStore.setPeisongType(query.peisongType)
  }

  function reload() {
    clearTimeout(timer)
    clearTimeout(promotionTimer)
    promotionDeadline = Number.POSITIVE_INFINITY
    revision++
    querying = false
    returnScrollTop = undefined
    shops.value = []
    void paging.value?.reload().catch(() => {})
  }

  /** 从其他入口进入列表，清空筛选并使旧请求和搜索定时器失效。 */
  function resetFilters(options: { defaultPickup?: boolean } = {}) {
    category.value = 'all'
    if (options.defaultPickup)
      shopStore.setPeisongType('zq')
    searchValue.value = ''
    countryCode.value = ''
    cityCode.value = ''
    districtCode.value = ''
    scrollTop = 0
    returnScrollTop = undefined
    paging.value?.scrollToY?.(0, 0, false)
    reload()
  }

  async function query(page: number, pageSize: number) {
    const ticket = ++revision
    querying = true
    const target = paging.value
    try {
      if (favoritesNeedLogin.value) {
        await target?.complete([])
        return
      }
      const rows = await shopApi.fetchShops({ ...(capability && { capability }), category: category.value, page, pageSize, nameLike: searchValue.value.trim(), countryCode: countryCode.value, cityCode: cityCode.value, districtCode: districtCode.value })
      if (disposed || ticket !== revision)
        return
      await target?.complete(rows.map(item => ({ ...toShop(item), distance: item.distance == null ? undefined : formatDistance(item.distance) })))
      if (!disposed && ticket === revision && visible && category.value === 'promotions') {
        clearTimeout(promotionTimer)
        const ends = rows.flatMap(item => item.promotions ?? []).map(item => promotionExpiresAt(item) + 50).filter(end => end > Date.now())
        promotionDeadline = Math.min(promotionDeadline, ...ends)
        if (Number.isFinite(promotionDeadline))
          promotionTimer = setTimeout(refreshKeepingPosition, Math.min(2147483647, promotionDeadline - Date.now()))
      }
    }
    catch {
      if (!disposed && ticket === revision)
        await target?.complete(false).catch(() => {})
    }
    finally {
      if (!disposed && ticket === revision) {
        querying = false
        await nextTick()
        restorePosition()
      }
    }
  }

  function searchChange(value: string) {
    searchValue.value = value
    clearTimeout(timer)
    clearTimeout(promotionTimer)
    promotionDeadline = Number.POSITIVE_INFINITY
    revision++
    timer = setTimeout(reload, 400)
  }

  function applyRegion(selection: ShopRegionSelection) {
    if (!regionsReady.value || regionsLoading.value || regionsError.value)
      return
    const country = regions.value.find(item => item.code === selection.countryCode)
    const city = country?.cities.find(item => item.code === selection.cityCode)
    const district = city?.districts.find(item => item.code === selection.districtCode)
    countryCode.value = country?.code ?? ''
    cityCode.value = city?.code ?? ''
    districtCode.value = district?.code ?? ''
    reload()
  }

  function goShop(shop: Shop) {
    returnScrollTop = scrollTop
    shopStore.setCurrent(shop)
    const target = takeShopSelectionTarget()
    void go(shopCheckoutReason(shop) ? ClientRoutes.Ordering.order : target || ClientRoutes.Ordering.order)
  }

  onScopeDispose(() => {
    disposed = true
    regionsVersion++
    revision++
    clearTimeout(timer)
    clearTimeout(promotionTimer)
  })

  return { setVisible, category, favorites, favoritesNeedLogin, loginForFavorites, emptyText, changeCategory, paging, shops, searchValue, countryCode, cityCode, districtCode, regionLabel, regions, regionsLoading, regionsError, regionsReady, loadRegions, selectedShopId, rememberScroll, restorePosition, init, query, reload, resetFilters, searchChange, applyRegion, goShop }
}
