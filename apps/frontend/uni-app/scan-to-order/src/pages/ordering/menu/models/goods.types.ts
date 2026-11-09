/**
 * ============================================================================
 * 【文件概述】菜单选品 / models/goods.types.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - Category：数据类型契约。
 * - Goods：数据类型契约。
 * - GoodsListResult：数据类型契约。
 * - PropertyChild：数据类型契约。
 * - GoodsProperty：数据类型契约。
 * - GoodsSubPic：数据类型契约。
 * - GoodsDetail：数据类型契约。
 * - AdditionItem：数据类型契约。
 * - AdditionGroup：数据类型契约。
 * - TimeSlot：数据类型契约。
 * - TimeScheduleDay：数据类型契约。
 * - SkuPriceResult：数据类型契约。
 * - SkuSelection：数据类型契约。
 * - SkuPayloadItem：数据类型契约。
 * - AdditionPayloadItem：数据类型契约。
 * - PriceQuote：数据类型契约。
 * - CategoryRange：数据类型契约。
 * - MenuSection：数据类型契约。
 * - MiaoshaCountdown：数据类型契约。
 * - GoodsListAction：数据类型契约。
 * - PingtuanSet：数据类型契约。
 * - PingtuanOpen：数据类型契约。
 * - PingtuanJoiner：数据类型契约。
 * - KanjiaSet：数据类型契约。
 * - KanjiaInfo：数据类型契约。
 * - GoodsListQuery：数据类型契约。
 * - GoodsOrderBy：数据类型契约。
 * 【综合使用示例】
 * import type { Category } from '@/pages/ordering/menu/models/goods.types'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * Category 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、icon、pid、level；必填与可选字段见声明。
 * @example
 * import type { Category } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: Category
 * const value: Category = response // => 保留 Category 的字段与取值约束
 */
export interface Category {
  id: number
  name: string
  icon?: string
  pid?: number
  level?: number
  [k: string]: unknown
}

/**
 * Goods 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、pic、minPrice、originalPrice、minScore、minBuyNumber、stores、categoryId、shopId、characteristic、miaosha、dateStart、dateEnd、pingtuan、pingtuanPrice、kanjia、numberSells、logisticsId、hasAddition、propertyIds、hasGoodsTimes、kanjiaPrice；必填与可选字段见声明。
 * @example
 * import type { Goods } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: Goods
 * const value: Goods = response // => 保留 Goods 的字段与取值约束
 */
export interface Goods {
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
 * GoodsListResult 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：result、totalRow、totalPage；必填与可选字段见声明。
 * @example
 * import type { GoodsListResult } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: GoodsListResult
 * const value: GoodsListResult = response // => 保留 GoodsListResult 的字段与取值约束
 */
export interface GoodsListResult {
  result: Goods[]
  totalRow?: number
  totalPage?: number
}

/**
 * PropertyChild 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、propertyId；必填与可选字段见声明。
 * @example
 * import type { PropertyChild } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: PropertyChild
 * const value: PropertyChild = response // => 保留 PropertyChild 的字段与取值约束
 */
export interface PropertyChild {
  id: number
  name: string
  price?: number
  propertyId?: number
  [k: string]: unknown
}

/**
 * GoodsProperty 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、childsCurGoods；必填与可选字段见声明。
 * @example
 * import type { GoodsProperty } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: GoodsProperty
 * const value: GoodsProperty = response // => 保留 GoodsProperty 的字段与取值约束
 */
export interface GoodsProperty {
  id: number
  name: string
  childsCurGoods: PropertyChild[]
}

/**
 * GoodsSubPic 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：optionValueId、pic；必填与可选字段见声明。
 * @example
 * import type { GoodsSubPic } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: GoodsSubPic
 * const value: GoodsSubPic = response // => 保留 GoodsSubPic 的字段与取值约束
 */
export interface GoodsSubPic {
  optionValueId?: number
  pic: string
}

/**
 * GoodsDetail 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：basicInfo、properties、pics、subPics、content、extJson；必填与可选字段见声明。
 * @example
 * import type { GoodsDetail } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: GoodsDetail
 * const value: GoodsDetail = response // => 保留 GoodsDetail 的字段与取值约束
 */
export interface GoodsDetail {
  basicInfo: Goods & {
    content?: string
    score?: number
    videoId?: string
    shopId?: number
  }
  properties?: GoodsProperty[]
  pics?: Array<{ pic: string, id?: number }>
  subPics?: GoodsSubPic[]
  content?: string
  extJson?: Record<string, unknown>
  [k: string]: unknown
}

/**
 * AdditionItem 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、pid、name、price；必填与可选字段见声明。
 * @example
 * import type { AdditionItem } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: AdditionItem
 * const value: AdditionItem = response // => 保留 AdditionItem 的字段与取值约束
 */
export interface AdditionItem {
  id: number
  pid: number
  name: string
  price: number
}

/**
 * AdditionGroup 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、name、type、required、items；必填与可选字段见声明。
 * @example
 * import type { AdditionGroup } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: AdditionGroup
 * const value: AdditionGroup = response // => 保留 AdditionGroup 的字段与取值约束
 */
export interface AdditionGroup {
  id: number
  name: string
  /** 0 单选，1 多选 */
  type: number
  required: boolean
  items: AdditionItem[]
}

/**
 * TimeSlot 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：name、price、stores；必填与可选字段见声明。
 * @example
 * import type { TimeSlot } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: TimeSlot
 * const value: TimeSlot = response // => 保留 TimeSlot 的字段与取值约束
 */
export interface TimeSlot {
  name: string
  price: number
  stores: number
}

/**
 * TimeScheduleDay 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：day、items；必填与可选字段见声明。
 * @example
 * import type { TimeScheduleDay } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: TimeScheduleDay
 * const value: TimeScheduleDay = response // => 保留 TimeScheduleDay 的字段与取值约束
 */
export interface TimeScheduleDay {
  day: string
  items: TimeSlot[]
}

/**
 * SkuPriceResult 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：price、originalPrice、pingtuanPrice、score、stores；必填与可选字段见声明。
 * @example
 * import type { SkuPriceResult } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: SkuPriceResult
 * const value: SkuPriceResult = response // => 保留 SkuPriceResult 的字段与取值约束
 */
export interface SkuPriceResult {
  price: number
  originalPrice: number
  pingtuanPrice?: number
  score: number
  stores: number
}

/* ========================= 规格选择（值对象） ========================= */

/**
 * 商品规格选择状态
 * - props: propertyId -> childId
 * - additions: 已选加料 id 集合（key 为 `${pid}-${id}`）
 * - time: [dayIndex, slotIndex]
 * 结构字段：props、additions、time；必填与可选字段见声明。
 * @example
 * import type { SkuSelection } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: SkuSelection
 * const value: SkuSelection = response // => 保留 SkuSelection 的字段与取值约束
 */
export interface SkuSelection {
  props: Record<number, number>
  additions: string[]
  time: [number, number] | null
}

/**
 * SkuPayloadItem 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：optionId、optionValueId、optionName、optionValueName；必填与可选字段见声明。
 * @example
 * import type { SkuPayloadItem } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: SkuPayloadItem
 * const value: SkuPayloadItem = response // => 保留 SkuPayloadItem 的字段与取值约束
 */
export interface SkuPayloadItem {
  optionId: number
  optionValueId: number
  optionName?: string
  optionValueName?: string
}

/**
 * AdditionPayloadItem 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、pid、pname、name；必填与可选字段见声明。
 * @example
 * import type { AdditionPayloadItem } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: AdditionPayloadItem
 * const value: AdditionPayloadItem = response // => 保留 AdditionPayloadItem 的字段与取值约束
 */
export interface AdditionPayloadItem {
  id: number
  pid: number
  pname?: string
  name?: string
}

/**
 * PriceQuote 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：price、originalPrice、score、maxBuy；必填与可选字段见声明。
 * @example
 * import type { PriceQuote } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: PriceQuote
 * const value: PriceQuote = response // => 保留 PriceQuote 的字段与取值约束
 */
export interface PriceQuote {
  price: number
  originalPrice: number
  score: number
  maxBuy: number
}

/**
 * CategoryRange 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：categoryId、categoryName、startIndex、endIndex；必填与可选字段见声明。
 * @example
 * import type { CategoryRange } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: CategoryRange
 * const value: CategoryRange = response // => 保留 CategoryRange 的字段与取值约束
 */
export interface CategoryRange {
  categoryId: number
  categoryName: string
  startIndex: number
  endIndex: number
}

/**
 * 连续滚动菜单的一个分段：一个分类及其商品
 * 结构字段：category、categoryIndex、goods；必填与可选字段见声明。
 * @example
 * import type { MenuSection } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: MenuSection
 * const value: MenuSection = response // => 保留 MenuSection 的字段与取值约束
 */
export interface MenuSection {
  category: Category
  /** 分类在完整分类列表中的下标 */
  categoryIndex: number
  goods: Goods[]
}

/**
 * MiaoshaCountdown 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：startIn、endIn；必填与可选字段见声明。
 * @example
 * import type { MiaoshaCountdown } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: MiaoshaCountdown
 * const value: MiaoshaCountdown = response // => 保留 MiaoshaCountdown 的字段与取值约束
 */
export interface MiaoshaCountdown {
  startIn: number
  endIn: number
}

/**
 * 列表商品按钮状态（原 index.wxml goods-btn 分支，按优先级）
 * soldOut 补货中 / notStart 即将开抢 / ended 秒杀结束 / kanjia 去砍价 / pingtuan 一起拼 / sku 选规格 / add 直接加购
 * 值约束：'soldOut' | 'notStart' | 'ended' | 'kanjia' | 'pingtuan' | 'sku' | 'add'。
 * @example
 * import type { GoodsListAction } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: GoodsListAction
 * const value: GoodsListAction = response // => 保留 GoodsListAction 的字段与取值约束
 */
export type GoodsListAction = 'soldOut' | 'notStart' | 'ended' | 'kanjia' | 'pingtuan' | 'sku' | 'add'
/* ---------------- 拼团 ---------------- */
/**
 * PingtuanSet 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：goodsId、numberOrder、timeoutHours；必填与可选字段见声明。
 * @example
 * import type { PingtuanSet } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: PingtuanSet
 * const value: PingtuanSet = response // => 保留 PingtuanSet 的字段与取值约束
 */
export interface PingtuanSet {
  goodsId: number
  numberOrder: number
  timeoutHours?: number
  [k: string]: unknown
}

/**
 * PingtuanOpen 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id；必填与可选字段见声明。
 * @example
 * import type { PingtuanOpen } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: PingtuanOpen
 * const value: PingtuanOpen = response // => 保留 PingtuanOpen 的字段与取值约束
 */
export interface PingtuanOpen {
  id: number
  [k: string]: unknown
}

/**
 * PingtuanJoiner 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：apiExtUserHelp；必填与可选字段见声明。
 * @example
 * import type { PingtuanJoiner } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: PingtuanJoiner
 * const value: PingtuanJoiner = response // => 保留 PingtuanJoiner 的字段与取值约束
 */
export interface PingtuanJoiner {
  apiExtUserHelp: { avatarUrl: string, nick?: string }
  [k: string]: unknown
}

/* ---------------- 砍价 ---------------- */
/**
 * KanjiaSet 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、goodsId、minPrice；必填与可选字段见声明。
 * @example
 * import type { KanjiaSet } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: KanjiaSet
 * const value: KanjiaSet = response // => 保留 KanjiaSet 的字段与取值约束
 */
export interface KanjiaSet {
  id: number
  goodsId: number
  minPrice: number
  [k: string]: unknown
}

/**
 * KanjiaInfo 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：kanjiaInfo、joiner、helps；必填与可选字段见声明。
 * @example
 * import type { KanjiaInfo } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: KanjiaInfo
 * const value: KanjiaInfo = response // => 保留 KanjiaInfo 的字段与取值约束
 */
export interface KanjiaInfo {
  kanjiaInfo: { curPrice: number, helpNumber: number, uid: number, [k: string]: unknown }
  joiner?: Record<string, unknown>
  helps?: unknown[]
  [k: string]: unknown
}

/**
 * GoodsListQuery 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：name、categoryId；必填与可选字段见声明。
 * @example
 * import type { GoodsListQuery } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: GoodsListQuery
 * const value: GoodsListQuery = response // => 保留 GoodsListQuery 的字段与取值约束
 */
export interface GoodsListQuery {
  name?: string
  categoryId?: string
}

/**
 * GoodsOrderBy 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：'' | 'addedDown' | 'ordersDown' | 'priceUp'。
 * @example
 * import type { GoodsOrderBy } from '@/pages/ordering/menu/models/goods.types'
 * declare const response: GoodsOrderBy
 * const value: GoodsOrderBy = response // => 保留 GoodsOrderBy 的字段与取值约束
 */
export type GoodsOrderBy = '' | 'addedDown' | 'ordersDown' | 'priceUp'
