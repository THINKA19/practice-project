/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / models/types.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - CartSkuItem：数据类型契约。
 * - CartAdditionItem：数据类型契约。
 * - CartItem：数据类型契约。
 * - CartInfo：数据类型契约。
 * - AddCartCommand：数据类型契约。
 * - OrderGoodsJsonItem：数据类型契约。
 * - TableOrderPageModel：数据类型契约。
 * 【综合使用示例】
 * import type { CartSkuItem } from '@/pages/ordering/menu-cart/models/types'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * 购物车上下文 - 领域模型
 * 结构字段：optionId、optionValueId、optionName、optionValueName；必填与可选字段见声明。
 * @example
 * import type { CartSkuItem } from '@/pages/ordering/menu-cart/models/types'
 * declare const response: CartSkuItem
 * const value: CartSkuItem = response // => 保留 CartSkuItem 的字段与取值约束
 */

export interface CartSkuItem {
  optionId?: number
  optionValueId?: number
  optionName?: string
  optionValueName?: string
}

/**
 * CartAdditionItem 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、pid、pname、name；必填与可选字段见声明。
 * @example
 * import type { CartAdditionItem } from '@/pages/ordering/menu-cart/models/types'
 * declare const response: CartAdditionItem
 * const value: CartAdditionItem = response // => 保留 CartAdditionItem 的字段与取值约束
 */
export interface CartAdditionItem {
  id?: number
  pid?: number
  pname?: string
  name?: string
}

/**
 * CartItem 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：key、goodsId、categoryId、shopId、name、pic、price、score、number、minBuyNumber、stores、selected、sku、additions、logisticsId、propertyChildIds、goodsTimesDay、goodsTimesItem、label；必填与可选字段见声明。
 * @example
 * import type { CartItem } from '@/pages/ordering/menu-cart/models/types'
 * declare const response: CartItem
 * const value: CartItem = response // => 保留 CartItem 的字段与取值约束
 */
export interface CartItem {
  key: string
  goodsId: number
  categoryId?: number
  shopId?: number
  name: string
  pic: string
  price: number
  score?: number
  number: number
  minBuyNumber?: number
  stores?: number
  selected?: boolean
  sku?: CartSkuItem[]
  additions?: CartAdditionItem[]
  logisticsId?: number
  /** 规格 id 串（无 sku 数组时由服务端直接给出） */
  propertyChildIds?: string
  goodsTimesDay?: string
  goodsTimesItem?: string
  /** 规格标签文案（结算页展示） */
  label?: string
  [k: string]: unknown
}

/**
 * CartInfo 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：items、number、price、score；必填与可选字段见声明。
 * @example
 * import type { CartInfo } from '@/pages/ordering/menu-cart/models/types'
 * declare const response: CartInfo
 * const value: CartInfo = response // => 保留 CartInfo 的字段与取值约束
 */
export interface CartInfo {
  items: CartItem[]
  number: number
  price: number
  score?: number
  [k: string]: unknown
}

/**
 * 加购参数（apifm /shopping-cart/add）
 * 结构字段：goodsId、number、sku、addition、goodsTimesDay、goodsTimesItem；必填与可选字段见声明。
 * @example
 * import type { AddCartCommand } from '@/pages/ordering/menu-cart/models/types'
 * declare const response: AddCartCommand
 * const value: AddCartCommand = response // => 保留 AddCartCommand 的字段与取值约束
 */
export interface AddCartCommand {
  goodsId: number
  number: number
  sku?: Array<{ optionId: number, optionValueId: number }>
  addition?: Array<{ id: number, pid: number }>
  goodsTimesDay?: string
  goodsTimesItem?: string
}

/**
 * 下单商品项（/order/create goodsJsonStr 元素）
 * 结构字段：goodsId、number、propertyChildIds、goodsAdditionList、logisticsType、inviter_id、goodsTimesDay、goodsTimesItem；必填与可选字段见声明。
 * @example
 * import type { OrderGoodsJsonItem } from '@/pages/ordering/menu-cart/models/types'
 * declare const response: OrderGoodsJsonItem
 * const value: OrderGoodsJsonItem = response // => 保留 OrderGoodsJsonItem 的字段与取值约束
 */
export interface OrderGoodsJsonItem {
  goodsId: number
  number: number
  propertyChildIds?: string
  goodsAdditionList?: Array<{ pid?: number, id?: number }>
  logisticsType: number
  inviter_id: string | number
  goodsTimesDay: string
  goodsTimesItem: string
}

/**
 * 桌台订单页面展示契约；订单实体由账户订单领域维护。
 * 结构字段：tableId、orderIds、loading；必填与可选字段见声明。
 * @example
 * import type { TableOrderPageModel } from '@/pages/ordering/menu-cart/models/types'
 * declare const response: TableOrderPageModel
 * const value: TableOrderPageModel = response // => 保留 TableOrderPageModel 的字段与取值约束
 */
export interface TableOrderPageModel { tableId: string, orderIds: number[], loading: boolean }
