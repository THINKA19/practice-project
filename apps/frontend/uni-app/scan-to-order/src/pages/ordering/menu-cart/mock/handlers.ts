/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / mock/handlers.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - 默认模拟接口或内部声明。
 * 【综合使用示例】
 * // 本文件通过现有 Mock 自动发现或领域内部导入接入，不增加页面路由。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import type { CartAdditionItemDto, CartSkuItemDto } from '../api/cart.dto'
import { endpoints } from '../api/endpoints'
import { cartState } from './state'
import { createGoodsDetail, goods, goodsAdditions, quoteMockSku } from '@/pages/ordering/menu/mock'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

interface Input { type?: string, key?: string, goodsId?: number, number?: number, sku?: string, addition?: string }

function parseOptions(raw: string | undefined): unknown[] | null {
  try {
    const value: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(value) ? value : null
  }
  catch {
    return null
  }
}

export default defineMock({
  [`[GET]${endpoints.info}`]: withFailure(({ query, headers }) => ok(cartState.snapshot(mockCustomerOwner(headers.Authorization), String(query.type ?? '')))),
  [`[POST]${endpoints.add}`]: withFailure(({ data, headers }) => {
    const q = data as Input
    const owner = mockCustomerOwner(headers.Authorization)
    const type = q.type ?? ''
    if (!Number.isSafeInteger(q.number) || Number(q.number) < 1)
      return fail('数量必须为正整数')
    const product = goods.find(g => g.id === Number(q.goodsId))
    if (!product || product.stores < Number(q.number))
      return fail('商品不存在或库存不足')
    const rawSku = parseOptions(q.sku)
    const rawExtras = parseOptions(q.addition)
    if (!rawSku || !rawExtras)
      return fail('规格或加料格式错误')
    const sku = rawSku as CartSkuItemDto[]
    const extras = rawExtras as CartAdditionItemDto[]
    const properties = createGoodsDetail(product.id)?.properties ?? []
    if (sku.some((value) => {
      const property = properties.find(group => group.id === value?.optionId)
      return !property?.childsCurGoods.some(choice => choice.id === value?.optionValueId)
    }) || new Set(sku.map(value => value.optionId)).size !== sku.length) {
      return fail('无效规格')
    }
    if (properties.some(group => !sku.some(value => value.optionId === group.id)))
      return fail('请选择规格', 30002)
    if (!product.hasAddition && extras.length)
      return fail('此商品不支持规格或加料')
    const selectedExtras = extras.map(a => goodsAdditions(product.id).flatMap(g => g.items).find(i => i.id === a?.id && i.pid === a?.pid))
    if (selectedExtras.some(a => !a) || new Set(extras.map(a => `${a.pid}:${a.id}`)).size !== extras.length)
      return fail('无效或重复加料')
    const price = quoteMockSku(product.id, sku.map(value => `${value.optionId}:${value.optionValueId}`).join(','))! + selectedExtras.reduce((sum, a) => sum + (a?.price ?? 0), 0)
    const key = JSON.stringify([product.id, [...sku].sort((a, b) => Number(a.optionId) - Number(b.optionId)), [...extras].sort((a, b) => Number(a.id) - Number(b.id))])
    const items = cartState.snapshot(owner, type).items
    const item = items.find(i => i.key === key || (product.id === 101 && i.key === 'demo-101'))
    if ((item?.number ?? 0) + Number(q.number) > product.stores)
      return fail('库存不足')
    if (item) {
      item.number += Number(q.number)
    }
    else {
      items.push({ key, goodsId: product.id, shopId: product.shopId, categoryId: product.categoryId, name: product.name, pic: product.pic, price, number: Number(q.number), minBuyNumber: product.minBuyNumber, stores: product.stores, selected: true, logisticsId: product.logisticsId, sku: sku.map((value) => {
        const group = properties.find(group => group.id === value.optionId)!
        const choice = group.childsCurGoods.find(choice => choice.id === value.optionValueId)!
        return { optionId: group.id, optionValueId: choice.id, optionName: group.name, optionValueName: choice.name }
      }), additions: selectedExtras.map(a => ({ ...a })) })
    }
    return ok(cartState.save(owner, type, items))
  }, { write: true }),
  [`[POST]${endpoints.modifyNumber}`]: withFailure(({ data, headers }) => {
    const q = data as Input
    const owner = mockCustomerOwner(headers.Authorization)
    const type = q.type ?? ''
    const items = cartState.snapshot(owner, type).items
    const item = items.find(i => i.key === q.key)
    if (!item || !Number.isSafeInteger(q.number) || Number(q.number) < 1 || Number(q.number) > Number(item.stores))
      return fail('商品不存在、数量无效或库存不足')
    item.number = Number(q.number)
    return ok(cartState.save(owner, type, items))
  }, { write: true }),
  [`[POST]${endpoints.remove}`]: withFailure(({ data, headers }) => {
    const q = data as Input
    const owner = mockCustomerOwner(headers.Authorization)
    const type = q.type ?? ''
    return ok(cartState.save(owner, type, cartState.snapshot(owner, type).items.filter(i => i.key !== q.key)))
  }, { write: true }),
  [`[POST]${endpoints.empty}`]: withFailure(({ data, headers }) => {
    const q = data as Input
    cartState.save(mockCustomerOwner(headers.Authorization), q.type ?? '', [])
    return ok(null)
  }, { write: true }),
})
