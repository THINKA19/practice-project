/**
 * ============================================================================
 * 【文件概述】门店领域纯业务类型与地图展示契约，不依赖页面流程。
 * 【方法与导出清单】Shop、ShopPromotion、ShopCategory、ShopDetail、PeisongType、ScanDining、ShopSelectPageModel、ShopDetailPageModel、MapMarker。
 * 【综合使用示例】import type { Shop, MapMarker } from '@/pages/ordering/index'; // 描述门店快照和派生地图标记
 * ============================================================================
 */
/** 活动契约：独立编号、发布状态、按天的起止日期与活动说明。@example declare const activity: ShopPromotion; activity.id // => 服务端活动编号 */
export interface ShopPromotion {
  id: string
  status: 'published' | 'draft' | 'withdrawn'
  /** YYYY-MM-DD，旧带时区时间戳兼容转换为业务日期。 */
  startsAt: string
  endsAt: string
  /** 旧接口兼容字段，适用限制统一写入 rules。 */
  applicableModes?: string[]
  title: string
  /** 旧接口兼容字段，不再单独展示。 */
  summary?: string
  rules: string
  /** 旧接口兼容字段，展示日期由 startsAt/endsAt 生成。 */
  period?: string
}

/** 选店入口：全部、当前顾客收藏、有效优惠活动；与地区和关键词同时生效。@example const category: ShopCategory = 'promotions' */
export type ShopCategory = 'all' | 'favorites' | 'promotions'

/** 门店公开快照，开业状态和优惠允许同时存在。@example const shop: Shop = { id: 1, name: '门店', openingState: 'new' } */
export interface Shop {
  /** 服务端确认的当前经营状态；缺失时不推断为正常营业。 */
  businessState?: 'open' | 'upcoming' | 'suspended' | 'resting'
  openingState?: 'new' | 'upcoming'
  openingDate?: string
  newUntil?: string
  promotions?: ShopPromotion[]
  id: number
  name: string
  countryCode?: string
  countryName?: string
  cityName?: string
  districtName?: string
  cityCode?: string
  districtCode?: string
  address?: string
  latitude?: number
  longitude?: number
  coordinateType?: 'gcj02' | 'wgs84'
  /** 距离（km），列表接口返回 */
  distance?: number | string
  /** 营业时间，如 "09:00-22:00"，跨天如 "18:00-02:00" */
  openingHours?: string
  linkPhone?: string
  pic?: string
  /** 门店周边地图预览；演示环境使用本地地图，正式数据由服务端提供。 */
  mapPreview?: string
  introduce?: string
  /** 门店实拍相册；无数据时使用封面。 */
  photos?: string[]
  /** 已确认的服务、设施名称；不根据介绍文本推测。 */
  services?: string[]
  arrivalGuide?: string
  parkingInfo?: string
  notice?: string
  status?: number
  [k: string]: unknown
}

/**
 * 门店详情接口返回
 * 结构字段：info、extJson；必填与可选字段见声明。
 * @example
 * import type { ShopDetail } from '@/pages/ordering/index/models/types'
 * declare const response: ShopDetail
 * const value: ShopDetail = response // => 保留 ShopDetail 的字段与取值约束
 */
export interface ShopDetail {
  info: Shop
  extJson?: Record<string, unknown>
  [k: string]: unknown
}

/**
 * 配送方式：zq 到店自取，kd 外卖配送
 * 值约束：'zq' | 'kd'。
 * @example
 * import type { PeisongType } from '@/pages/ordering/index/models/types'
 * declare const response: PeisongType
 * const value: PeisongType = response // => 保留 PeisongType 的字段与取值约束
 */
export type PeisongType = 'zq' | 'kd'

/**
 * 扫码点餐桌台
 * 结构字段：shopId、id、key；必填与可选字段见声明。
 * @example
 * import type { ScanDining } from '@/pages/ordering/index/models/types'
 * declare const response: ScanDining
 * const value: ScanDining = response // => 保留 ScanDining 的字段与取值约束
 */
export interface ScanDining {
  /** 服务端返回的展示桌号；缺失时不把内部 id 当作桌号。 */
  tableCode?: string
  shopId: string
  id: string
  key: string
}

/**
 * ShopSelectPageModel 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：keyword、selectedShopId；必填与可选字段见声明。
 * @example
 * import type { ShopSelectPageModel } from '@/pages/ordering/index/models/types'
 * declare const response: ShopSelectPageModel
 * const value: ShopSelectPageModel = response // => 保留 ShopSelectPageModel 的字段与取值约束
 */
export interface ShopSelectPageModel { keyword: string, selectedShopId: number | null }
/**
 * ShopDetailPageModel 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：shopId、loading；必填与可选字段见声明。
 * @example
 * import type { ShopDetailPageModel } from '@/pages/ordering/index/models/types'
 * declare const response: ShopDetailPageModel
 * const value: ShopDetailPageModel = response // => 保留 ShopDetailPageModel 的字段与取值约束
 */
export interface ShopDetailPageModel { shopId: number, loading: boolean }
/**
 * 地图标记的展示契约；所有坐标单位为度，图标尺寸单位为像素。示例：{ id: 0, latitude: 21, longitude: 105, iconPath: '/pin.png', width: 30, height: 40 }。
 * 结构字段：id、latitude、longitude、iconPath、width、height；必填与可选字段见声明。
 * @example
 * import type { MapMarker } from '@/pages/ordering/index/models/types'
 * declare const response: MapMarker
 * const value: MapMarker = response // => 保留 MapMarker 的字段与取值约束
 */
export interface MapMarker {
  id: number
  latitude: number
  longitude: number
  iconPath: string
  width: number
  height: number
}
