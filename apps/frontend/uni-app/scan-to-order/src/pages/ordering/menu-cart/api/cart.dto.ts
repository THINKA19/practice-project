/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / api/cart.dto.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - CartSkuItemDto：数据类型契约。
 * - CartAdditionItemDto：数据类型契约。
 * - CartItemDto：数据类型契约。
 * - CartInfoDto：数据类型契约。
 * - AddCartRequestDto：数据类型契约。
 * 【综合使用示例】
 * import type { CartSkuItemDto } from '@/pages/ordering/menu-cart/api/cart.dto'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/** 原始接口契约；字段按现有页面需求整理，待真实后端联调确认。 */
/** 当前页面使用的原始接口契约；真实后端字段仍需联调确认。 */
/**
 * 购物车上下文 - 领域模型
 * 结构字段：optionId、optionValueId、optionName、optionValueName；必填与可选字段见声明。
 * @example
 * import type { CartSkuItemDto } from '@/pages/ordering/menu-cart/api/cart.dto'
 * declare const response: CartSkuItemDto
 * const value: CartSkuItemDto = response // => 保留 CartSkuItemDto 的字段与取值约束
 */

export interface CartSkuItemDto {
  optionId?: number
  optionValueId?: number
  optionName?: string
  optionValueName?: string
}

/**
 * CartAdditionItemDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、pid、pname、name；必填与可选字段见声明。
 * @example
 * import type { CartAdditionItemDto } from '@/pages/ordering/menu-cart/api/cart.dto'
 * declare const response: CartAdditionItemDto
 * const value: CartAdditionItemDto = response // => 保留 CartAdditionItemDto 的字段与取值约束
 */
export interface CartAdditionItemDto {
  id?: number
  pid?: number
  pname?: string
  name?: string
}

/**
 * CartItemDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：key、goodsId、categoryId、shopId、name、pic、price、score、number、minBuyNumber、stores、selected、sku、additions、logisticsId、propertyChildIds、goodsTimesDay、goodsTimesItem、label；必填与可选字段见声明。
 * @example
 * import type { CartItemDto } from '@/pages/ordering/menu-cart/api/cart.dto'
 * declare const response: CartItemDto
 * const value: CartItemDto = response // => 保留 CartItemDto 的字段与取值约束
 */
export interface CartItemDto {
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
  sku?: CartSkuItemDto[]
  additions?: CartAdditionItemDto[]
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
 * CartInfoDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：items、number、price、score；必填与可选字段见声明。
 * @example
 * import type { CartInfoDto } from '@/pages/ordering/menu-cart/api/cart.dto'
 * declare const response: CartInfoDto
 * const value: CartInfoDto = response // => 保留 CartInfoDto 的字段与取值约束
 */
export interface CartInfoDto {
  items: CartItemDto[]
  number: number
  price: number
  score?: number
  [k: string]: unknown
}

/**
 * 加购参数（apifm /shopping-cart/add）
 * 结构字段：goodsId、number、sku、addition、goodsTimesDay、goodsTimesItem；必填与可选字段见声明。
 * @example
 * import type { AddCartRequestDto } from '@/pages/ordering/menu-cart/api/cart.dto'
 * declare const response: AddCartRequestDto
 * const value: AddCartRequestDto = response // => 保留 AddCartRequestDto 的字段与取值约束
 */
export interface AddCartRequestDto {
  goodsId: number
  number: number
  sku: string
  addition: string
  goodsTimesDay?: string
  goodsTimesItem?: string
}
