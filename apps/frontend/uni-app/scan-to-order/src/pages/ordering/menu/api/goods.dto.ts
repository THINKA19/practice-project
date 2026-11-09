/**
 * ============================================================================
 * 【文件概述】菜单选品 / api/goods.dto.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - CategoryDto：数据类型契约。
 * - GoodsDto：数据类型契约。
 * - GoodsListResultDto：数据类型契约。
 * - PropertyChildDto：数据类型契约。
 * - GoodsPropertyDto：数据类型契约。
 * - GoodsSubPicDto：数据类型契约。
 * - GoodsDetailDto：数据类型契约。
 * - AdditionItemDto：数据类型契约。
 * - AdditionGroupDto：数据类型契约。
 * - TimeSlotDto：数据类型契约。
 * - TimeScheduleDayDto：数据类型契约。
 * - SkuPriceResultDto：数据类型契约。
 * - PingtuanSetDto：数据类型契约。
 * - PingtuanOpenDto：数据类型契约。
 * - PingtuanJoinerDto：数据类型契约。
 * 【综合使用示例】
 * import type { CategoryDto } from '@/pages/ordering/menu/api/goods.dto'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/** 原始接口契约；字段按现有页面需求整理，待真实后端联调确认。 */
/**
 * 当前页面使用的原始接口契约；真实后端字段仍需联调确认。
 * 结构字段：id、name、icon、pid、level；必填与可选字段见声明。
 * @example
 * import type { CategoryDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: CategoryDto
 * const value: CategoryDto = response // => 保留 CategoryDto 的字段与取值约束
 */
export interface CategoryDto {
  id: number
  name: string
  icon?: string
  pid?: number
  level?: number
  [k: string]: unknown
}

/**
 * GoodsDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、pic、minPrice、originalPrice、minScore、minBuyNumber、stores、categoryId、shopId、characteristic、miaosha、dateStart、dateEnd、pingtuan、pingtuanPrice、kanjia、numberSells、logisticsId、hasAddition、propertyIds、hasGoodsTimes、kanjiaPrice；必填与可选字段见声明。
 * @example
 * import type { GoodsDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: GoodsDto
 * const value: GoodsDto = response // => 保留 GoodsDto 的字段与取值约束
 */
export interface GoodsDto {
  id: number
  name: string
  pic: string
  minPrice: number
  originalPrice: number
  minScore?: number
  minBuyNumber: number
  stores: number
  categoryId: number
  shopId?: number
  /** 独立标签，最多展示两个；不替换商品描述。 */
  tags?: { id?: number | string, label: string, tone?: 'green' | 'orange', emphasis?: 'primary' | 'normal' }[]
  characteristic?: string
  /** 是否秒杀 */
  miaosha?: boolean
  dateStart?: string
  dateEnd?: string
  pingtuan?: boolean
  pingtuanPrice?: number
  kanjia?: boolean
  numberSells?: number
  logisticsId?: number
  hasAddition?: boolean
  /** 规格 id 串，非空表示有规格 */
  propertyIds?: string
  /** 是否时段定价 */
  hasGoodsTimes?: boolean
  /** 砍价底价 */
  kanjiaPrice?: number
  [k: string]: unknown
}

/**
 * GoodsListResultDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：result、totalRow、totalPage；必填与可选字段见声明。
 * @example
 * import type { GoodsListResultDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: GoodsListResultDto
 * const value: GoodsListResultDto = response // => 保留 GoodsListResultDto 的字段与取值约束
 */
export interface GoodsListResultDto {
  result: GoodsDto[]
  totalRow?: number
  totalPage?: number
}

/**
 * PropertyChildDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、propertyId；必填与可选字段见声明。
 * @example
 * import type { PropertyChildDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: PropertyChildDto
 * const value: PropertyChildDto = response // => 保留 PropertyChildDto 的字段与取值约束
 */
export interface PropertyChildDto {
  id: number
  name: string
  price?: number
  propertyId?: number
  [k: string]: unknown
}

/**
 * GoodsPropertyDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、childsCurGoods；必填与可选字段见声明。
 * @example
 * import type { GoodsPropertyDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: GoodsPropertyDto
 * const value: GoodsPropertyDto = response // => 保留 GoodsPropertyDto 的字段与取值约束
 */
export interface GoodsPropertyDto {
  id: number
  name: string
  childsCurGoods: PropertyChildDto[]
}

/**
 * GoodsSubPicDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：optionValueId、pic；必填与可选字段见声明。
 * @example
 * import type { GoodsSubPicDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: GoodsSubPicDto
 * const value: GoodsSubPicDto = response // => 保留 GoodsSubPicDto 的字段与取值约束
 */
export interface GoodsSubPicDto {
  optionValueId?: number
  pic: string
}

/**
 * GoodsDetailDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：basicInfo、properties、pics、subPics、content、extJson；必填与可选字段见声明。
 * @example
 * import type { GoodsDetailDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: GoodsDetailDto
 * const value: GoodsDetailDto = response // => 保留 GoodsDetailDto 的字段与取值约束
 */
export interface GoodsDetailDto {
  basicInfo: GoodsDto & {
    content?: string
    score?: number
    videoId?: string
    shopId?: number
  }
  properties?: GoodsPropertyDto[]
  pics?: Array<{ pic: string, id?: number }>
  subPics?: GoodsSubPicDto[]
  content?: string
  extJson?: Record<string, unknown>
  [k: string]: unknown
}

/**
 * AdditionItemDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、pid、name、price；必填与可选字段见声明。
 * @example
 * import type { AdditionItemDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: AdditionItemDto
 * const value: AdditionItemDto = response // => 保留 AdditionItemDto 的字段与取值约束
 */
export interface AdditionItemDto {
  id: number
  pid: number
  name: string
  price: number
}

/**
 * AdditionGroupDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、type、required、items；必填与可选字段见声明。
 * @example
 * import type { AdditionGroupDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: AdditionGroupDto
 * const value: AdditionGroupDto = response // => 保留 AdditionGroupDto 的字段与取值约束
 */
export interface AdditionGroupDto {
  id: number
  name: string
  /** 0 单选，1 多选 */
  type: number
  required: boolean
  items: AdditionItemDto[]
}

/**
 * TimeSlotDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：name、price、stores；必填与可选字段见声明。
 * @example
 * import type { TimeSlotDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: TimeSlotDto
 * const value: TimeSlotDto = response // => 保留 TimeSlotDto 的字段与取值约束
 */
export interface TimeSlotDto {
  name: string
  price: number
  stores: number
}

/**
 * TimeScheduleDayDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：day、items；必填与可选字段见声明。
 * @example
 * import type { TimeScheduleDayDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: TimeScheduleDayDto
 * const value: TimeScheduleDayDto = response // => 保留 TimeScheduleDayDto 的字段与取值约束
 */
export interface TimeScheduleDayDto {
  day: string
  items: TimeSlotDto[]
}

/**
 * SkuPriceResultDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：price、originalPrice、pingtuanPrice、score、stores；必填与可选字段见声明。
 * @example
 * import type { SkuPriceResultDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: SkuPriceResultDto
 * const value: SkuPriceResultDto = response // => 保留 SkuPriceResultDto 的字段与取值约束
 */
export interface SkuPriceResultDto {
  price: number
  originalPrice: number
  pingtuanPrice?: number
  score: number
  stores: number
}

/* ---------------- 拼团 ---------------- */
/**
 * PingtuanSetDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：goodsId、numberOrder、timeoutHours；必填与可选字段见声明。
 * @example
 * import type { PingtuanSetDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: PingtuanSetDto
 * const value: PingtuanSetDto = response // => 保留 PingtuanSetDto 的字段与取值约束
 */
export interface PingtuanSetDto {
  goodsId: number
  numberOrder: number
  timeoutHours?: number
  [k: string]: unknown
}

/**
 * PingtuanOpenDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id；必填与可选字段见声明。
 * @example
 * import type { PingtuanOpenDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: PingtuanOpenDto
 * const value: PingtuanOpenDto = response // => 保留 PingtuanOpenDto 的字段与取值约束
 */
export interface PingtuanOpenDto {
  id: number
  [k: string]: unknown
}

/**
 * PingtuanJoinerDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：apiExtUserHelp；必填与可选字段见声明。
 * @example
 * import type { PingtuanJoinerDto } from '@/pages/ordering/menu/api/goods.dto'
 * declare const response: PingtuanJoinerDto
 * const value: PingtuanJoinerDto = response // => 保留 PingtuanJoinerDto 的字段与取值约束
 */
export interface PingtuanJoinerDto {
  apiExtUserHelp: { avatarUrl: string, nick?: string }
  [k: string]: unknown
}
