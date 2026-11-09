import { effectScope, ref } from 'vue'
import { catalogApi } from '../api/catalog.api'
import { toGoodsDetail } from '../models/goods.mappers'
import { useOrderingSkuSelection } from '../composables/use-sku-selection'
import { describe, expect, it, vi } from 'vitest'
import { createGoodsDetail, goods, goodsAdditions, quoteMockSku } from '../mock/fixtures/goods'

describe('莲香米粉中心店', () => {
  it('has an independent noodle menu and valid categories', () => {
    const menu = goods.filter(g => g.shopId === 100)
    expect(menu).toHaveLength(6)
    expect(menu.filter(g => g.propertyIds).every(g => g.name.includes('米粉'))).toBe(true)
    expect(menu.every(g => [1001, 1002, 1003].includes(g.categoryId!))).toBe(true)
    expect(createGoodsDetail(100901)?.properties?.map(g => g.name)).toEqual(['份量', '辣度（同价）', '粉种（同价）'])
  })
  it('quotes portions independently while spice and noodle type stay the same price', () => {
    expect(quoteMockSku(100901, '101:1011,102:1021,103:1031')).toBe(4.8)
    expect(quoteMockSku(100901, '101:1012,102:1021,103:1031')).toBe(5.8)
    expect(quoteMockSku(100901, '101:1013,102:1021,103:1031')).toBe(6.8)
    expect(quoteMockSku(100901, '101:1013,102:1023,103:1032')).toBe(6.8)
    expect(quoteMockSku(100902, '101:1013,102:1023,103:1032')).toBe(8.5)
    expect(quoteMockSku(100901, '101:1013')).toBeNull()
    expect(quoteMockSku(100901, '101:999,102:1021,103:1031')).toBeNull()
  })
  it('scopes additions to the product and preserves other shops', () => {
    expect(goodsAdditions(100901)[0].items.map(i => i.name)).toEqual(['鸡蛋', '牛肉'])
    expect(goodsAdditions(100906)).toEqual([])
    expect(goodsAdditions(102)[0].items[0].name).toBe('珍珠')
    expect(goods.some(g => g.shopId === 101)).toBe(true)
  })
})

it('selection quote includes paid extras once and produces the same cart options', async () => {
  const request = vi.spyOn(catalogApi, 'goodsPrice').mockImplementation(async (id, options) => ({ price: quoteMockSku(id, options)!, originalPrice: 0, stores: 50, score: 0 }))
  const scope = effectScope()
  const sku = scope.run(() => useOrderingSkuSelection({ detail: ref(toGoodsDetail(createGoodsDetail(100901)!)) }))!
  try {
    sku.additions.value = goodsAdditions(100901)
    sku.chooseProperty(101, 1013)
    sku.chooseProperty(102, 1022)
    sku.chooseProperty(103, 1031)
    expect(sku.isPropertiesComplete(false)).toBe(true)
    await sku.requote(true)
    expect(sku.quote.value?.price).toBe(6.8)
    sku.chooseAdditionById(100, 1001)
    expect(sku.quote.value?.price).toBe(7.3)
    const payload = sku.cartPayload(2)!
    expect(payload.goodsId).toBe(100901)
    expect(payload.number).toBe(2)
    expect(payload.sku).toContainEqual({ optionId: 101, optionValueId: 1013 })
    expect(payload.addition).toEqual([{ pid: 100, id: 1001 }])
    sku.chooseAdditionById(100, 1001)
    expect(sku.quote.value?.price).toBe(6.8)
    sku.reset()
    expect(sku.isPropertiesComplete(false)).toBe(false)
    expect(sku.selection.value.additions).toEqual([])
  }
  finally {
    scope.stop()
    request.mockRestore()
  }
})
