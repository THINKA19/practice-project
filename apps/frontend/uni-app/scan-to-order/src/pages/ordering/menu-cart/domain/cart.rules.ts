/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / domain/cart.rules.ts
 * 规则层：维护不依赖页面生命周期的纯业务规则。
 * 【方法与导出清单】
 * - describeCartItem：本文件对外声明。
 * - quickAddNumber：本文件对外声明。
 * - isCartEmpty：本文件对外声明。
 * - isCartItemShortage：本文件对外声明。
 * - skuToPropertyChildIds：本文件对外声明。
 * - toOrderGoodsJson：本文件对外声明。
 * - toTableOrderGoodsJson：本文件对外声明。
 * - shouldRemoveOnChange：本文件对外声明。
 * 【综合使用示例】
 * import { describeCartItem } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { CartInfo, CartItem, CartSkuItem, OrderGoodsJsonItem } from '../models/types'
/** 统一已选摘要：结构化规格优先，label 仅兜底，选项原名不额外添加前缀。 */
export function describeCartItem(
  item: Pick<CartItem, 'sku' | 'additions'> & Partial<Pick<CartItem, 'label' | 'goodsTimesDay' | 'goodsTimesItem'>>,
): string {
  const parts = (item.sku ?? []).map(option => option.optionValueName?.trim()).filter((value): value is string => !!value)
  if (!parts.length && item.label?.trim())
    parts.push(item.label.trim())
  parts.push(...(item.additions ?? []).filter(option => option.name?.trim()).map(option => option.name!.trim()))
  const time = [item.goodsTimesDay, item.goodsTimesItem].filter(Boolean).join(' ')
  if (time)
    parts.push(time)
  return parts.join('·')
}

/**
 * 快速加购数量规则（原 addCart1）：
 * 购物车已有该商品则 +1，否则按起购数量
 * @param cart {CartInfo | null} 当前购物车快照，null 表示没有数据。
 * @param goodsId {number} 商品标识。
 * @param minBuyNumber {number} 商品起购数量。
 * @returns number。
 * @example
 * import { quickAddNumber } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * declare const cart: Parameters<typeof quickAddNumber>[0]
 * declare const goodsId: Parameters<typeof quickAddNumber>[1]
 * declare const minBuyNumber: Parameters<typeof quickAddNumber>[2]
 * quickAddNumber(cart, goodsId, minBuyNumber) // => number
 */
export function quickAddNumber(cart: CartInfo | null, goodsId: number, minBuyNumber: number): number {
  const exists = cart?.items?.some(i => i.goodsId === goodsId)

  return exists ? 1 : Math.max(1, minBuyNumber || 1)
}

/**
 * isCartEmpty：供本领域调用的数据声明。
 * @param cart {CartInfo | null} 当前购物车快照，null 表示没有数据。
 * @returns boolean。
 * @example
 * import { isCartEmpty } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * declare const cart: Parameters<typeof isCartEmpty>[0]
 * isCartEmpty(cart) // => boolean
 */
export function isCartEmpty(cart: CartInfo | null): boolean {
  return !cart || !cart.items || cart.items.length === 0
}

/**
 * 是否缺货（库存小于起购数量，原 wxml `item.minBuyNumber && item.stores < item.minBuyNumber`）
 * @param item {Pick<CartItem, 'minBuyNumber' | 'stores'>} 当前业务条目。
 * @returns boolean。
 * @example
 * import { isCartItemShortage } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * declare const item: Parameters<typeof isCartItemShortage>[0]
 * isCartItemShortage(item) // => boolean
 */
export function isCartItemShortage(item: Pick<CartItem, 'minBuyNumber' | 'stores'>): boolean {
  return !!item.minBuyNumber && Number(item.stores) < item.minBuyNumber
}

/**
 * sku 数组 → propertyChildIds（形如 ",1:2,3:4"，与原实现一致保留前导逗号）
 * @param sku {CartSkuItem[]} 购物车规格条目。
 * @returns string。
 * @example
 * import { skuToPropertyChildIds } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * skuToPropertyChildIds() // => string
 */
export function skuToPropertyChildIds(sku?: CartSkuItem[]): string {
  let ids = ''
  ;
  (sku || []).forEach((s) => {
    ids += `,${s.optionId}:${s.optionValueId}`
  })

  return ids
}

/**
 * 购物车商品 → 下单商品（原 pay/index.js processYunfei）
 * - 库存小于起购数量的商品跳过
 * - 任一商品需要物流则 isNeedLogistics
 * @param items {CartItem[]} 待转换或汇总的商品条目。
 * @param inviterId {string | number} 分享来源账户标识。
 * @returns { goods: OrderGoodsJsonItem[], isNeedLogistics: boolean }。
 * @example
 * import { toOrderGoodsJson } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * declare const items: Parameters<typeof toOrderGoodsJson>[0]
 * toOrderGoodsJson(items) // => { goods: OrderGoodsJsonItem[], isNeedLogistics: boolean }
 */
export function toOrderGoodsJson(items: CartItem[], inviterId: string | number = 0): { goods: OrderGoodsJsonItem[], isNeedLogistics: boolean } {
  const goods: OrderGoodsJsonItem[] = []

  let isNeedLogistics = false

  items.forEach((item) => {
    if (Number(item.stores) < Number(item.minBuyNumber)) {
      return
    }

    if (item.logistics || item.logisticsId) {
      isNeedLogistics = true
    }

    const row: OrderGoodsJsonItem = {
      propertyChildIds: item.propertyChildIds,
      goodsId: item.goodsId,
      number: item.number,
      logisticsType: 0,
      inviter_id: inviterId || 0,
      goodsTimesDay: item.goodsTimesDay || '',
      goodsTimesItem: item.goodsTimesItem || '',
    }

    if (item.sku && item.sku.length > 0) {
      row.propertyChildIds = skuToPropertyChildIds(item.sku)
    }

    if (item.additions && item.additions.length > 0) {
      row.goodsAdditionList = item.additions.map(a => ({ pid: a.pid, id: a.id }))
    }

    goods.push(row)
  })

  return { goods, isNeedLogistics }
}

/**
 * 购物车商品 → 扫码点餐桌台加菜商品（原 cart/index.js goCreateOrder）
 * @param items {CartItem[]} 待转换或汇总的商品条目。
 * @returns Array<{ goodsId: number, number: number, propertyChildIds: string }>。
 * @example
 * import { toTableOrderGoodsJson } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * declare const items: Parameters<typeof toTableOrderGoodsJson>[0]
 * toTableOrderGoodsJson(items) // => Array<{ goodsId: number, number: number, propertyChildIds: string }>
 */
export function toTableOrderGoodsJson(items: CartItem[]): Array<{ goodsId: number, number: number, propertyChildIds: string }> {
  return items.map(item => ({
    goodsId: item.goodsId,
    number: item.number,
    propertyChildIds: skuToPropertyChildIds(item.sku),
  }))
}

/**
 * 步进器改到该数量时是否应删除商品（原 cartStepChange：小于起购数量即删除）
 * @param item {Pick<CartItem, 'minBuyNumber'>} 当前业务条目。
 * @param nextNumber {number} 用户调整后的数量。
 * @returns boolean。
 * @example
 * import { shouldRemoveOnChange } from '@/pages/ordering/menu-cart/domain/cart.rules'
 * declare const item: Parameters<typeof shouldRemoveOnChange>[0]
 * declare const nextNumber: Parameters<typeof shouldRemoveOnChange>[1]
 * shouldRemoveOnChange(item, nextNumber) // => boolean
 */
export function shouldRemoveOnChange(item: Pick<CartItem, 'minBuyNumber'>, nextNumber: number): boolean {
  return nextNumber < Math.max(1, Number(item.minBuyNumber) || 1)
}

/** 按选项 ID 和时段比较配置，不依赖名称或数组顺序。 */
export function cartSelectionKey(item: { goodsId: number, sku?: CartSkuItem[], additions?: { pid?: number, id?: number }[], goodsTimesDay?: string, goodsTimesItem?: string }): string {
  return JSON.stringify([item.goodsId, (item.sku ?? []).map(value => [value.optionId, value.optionValueId]).sort((a, b) => Number(a[0]) - Number(b[0])), (item.additions ?? []).map(value => [value.pid, value.id]).sort((a, b) => Number(a[0]) - Number(b[0]) || Number(a[1]) - Number(b[1])), item.goodsTimesDay || '', item.goodsTimesItem || ''])
}
