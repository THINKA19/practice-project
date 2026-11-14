/**
 * ============================================================================
 * 【文件概述】门店数据与选店领域公开入口；详情和位置页面流程由各自领域持有。
 * 【方法与导出清单】shopApi、门店类型/转换、业务规则、useShopStore、地区类型、orderingSettings。
 * 【综合使用示例】import { shopApi } from '@/pages/ordering/index'; await shopApi.detail(1) // => 后端门店详情响应
 * ============================================================================
 */
export { shopApi } from './api/shop.api'
export { default as ShopBusinessBadge } from './components/ShopBusinessBadge/index.vue'
export { default as ShopFavorite } from './components/ShopFavorite/index.vue'
export { default as ShopLabels } from './components/ShopLabels/index.vue'
export { useShopCheckoutAvailability } from './composables/use-checkout-availability'
export { useOrderingCurrency } from './composables/use-currency'
export { orderingSettings } from './config'
export { shopBusinessLabel, shopBusinessState, shopCheckoutReason } from './domain/shop.rules'
/** 本模块公共入口，仅导出外部使用的能力。 */
export { isShopOpened } from './domain/shop.rules'
export { parseScanScene } from './domain/shop.rules'
export { formatDistance } from './domain/shop.rules'
export { distanceLine } from './domain/shop.rules'
export { convertShopPoint } from './models/coordinates'
export { amapNavigationUrl, appleNavigationUrl, baiduNavigationUrl, googleEmbedUrl, googleNavigationUrl, tencentNavigationUrl } from './models/map-links'
export { toDistance, toPickPoints } from './models/mappers'
export { toShopDetail } from './models/mappers'
export { toShopRegions } from './models/region-mappers'
export type { ShopRegion, ShopRegionSelection } from './models/regions'
export type { ShopDetail } from './models/types'
export type { MapMarker } from './models/types'

export type { PeisongType } from './models/types'

export type { Shop } from './models/types'
export type { ScanDining } from './models/types'
export { openShopList } from './navigation'

export { useShopStore } from './store'
