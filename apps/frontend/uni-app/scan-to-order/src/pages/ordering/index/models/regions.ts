/** 开放经营地区模型；数据只从业务接口读取，不内置地区目录。 */
export interface ShopRegionArea { code: string, name: string }
export interface ShopRegionCity extends ShopRegionArea { districts: ShopRegionArea[] }
export interface ShopRegion extends ShopRegionArea { cities: ShopRegionCity[] }

/**
 * ShopRegionSelection 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：countryCode、cityCode、districtCode；必填与可选字段见声明。
 * @example
 * import type { ShopRegionSelection } from '@/pages/ordering/index/models/regions'
 * declare const response: ShopRegionSelection
 * const value: ShopRegionSelection = response // => 保留 ShopRegionSelection 的字段与取值约束
 */
export interface ShopRegionSelection { countryCode: string, cityCode: string, districtCode: string }
