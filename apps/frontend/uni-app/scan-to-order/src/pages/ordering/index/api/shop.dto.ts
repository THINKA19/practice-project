/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / api/shop.dto.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - ShopDto：数据类型契约。
 * - ShopDetailDto：数据类型契约。
 * - TableSessionDto：数据类型契约。
 * - DistanceDto：数据类型契约。
 * 【综合使用示例】
 * import type { ShopDto } from '@/pages/ordering/index/api/shop.dto'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/** 原始接口契约；字段按现有页面需求整理，待真实后端联调确认。 */
/**
 * 当前页面使用的原始接口契约；真实后端字段仍需联调确认。
 * 结构字段：id、name、countryCode、cityCode、districtCode、address、latitude、longitude、coordinateType、distance、openingHours、linkPhone、pic、mapPreview、introduce、photos、services、arrivalGuide、parkingInfo、notice、status；必填与可选字段见声明。
 * @example
 * import type { ShopDto } from '@/pages/ordering/index/api/shop.dto'
 * declare const response: ShopDto
 * const value: ShopDto = response // => 保留 ShopDto 的字段与取值约束
 */
export interface ShopDto {
  /** 新增待联调契约，不映射含义未确认的数字 status。 */
  businessState?: 'open' | 'upcoming' | 'suspended' | 'resting'
  openingState?: 'new' | 'upcoming'
  openingDate?: string
  newUntil?: string
  /** 发布与时间字段由后端负责，前端在模型边界校验。 */
  promotions?: Array<{ id: string, status: 'published' | 'draft' | 'withdrawn', startsAt: string, endsAt: string, applicableModes?: string[], title: string, summary?: string, rules: string, period?: string }>
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
  photos?: string[]
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
 * import type { ShopDetailDto } from '@/pages/ordering/index/api/shop.dto'
 * declare const response: ShopDetailDto
 * const value: ShopDetailDto = response // => 保留 ShopDetailDto 的字段与取值约束
 */
export interface ShopDetailDto {
  info: ShopDto
  extJson?: Record<string, unknown>
  [k: string]: unknown
}

/**
 * TableSessionDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：token、uid；必填与可选字段见声明。
 * @example
 * import type { TableSessionDto } from '@/pages/ordering/index/api/shop.dto'
 * declare const response: TableSessionDto
 * const value: TableSessionDto = response // => 保留 TableSessionDto 的字段与取值约束
 */
export interface TableSessionDto { token: string, uid: number, [k: string]: unknown }

/**
 * DistanceDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：result；必填与可选字段见声明。
 * @example
 * import type { DistanceDto } from '@/pages/ordering/index/api/shop.dto'
 * declare const response: DistanceDto
 * const value: DistanceDto = response // => 保留 DistanceDto 的字段与取值约束
 */
export interface DistanceDto { result?: { rows?: Array<{ elements?: Array<{ distance?: number }> }> } }
