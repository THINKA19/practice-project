import type { CartItem } from '@/pages/ordering/menu-cart'
import { describe, expect, it } from 'vitest'
import { isCartItemShortage, shouldRemoveOnChange, skuToPropertyChildIds, toOrderGoodsJson, toTableOrderGoodsJson } from '@/pages/ordering/menu-cart'

function item(p: Partial<CartItem>): CartItem {
  return { key: 'k', goodsId: 1, name: 'n', pic: '', price: 10, number: 1, ...p }
}
describe('cart → order 商品转换', () => {
  it('sku 转 propertyChildIds 保留前导逗号', () => {
    expect(skuToPropertyChildIds([{ optionId: 1, optionValueId: 2 }, { optionId: 3, optionValueId: 4 }])).toBe(',1:2,3:4')

    expect(skuToPropertyChildIds()).toBe('')
  })

  it('toOrderGoodsJson：跳过缺货商品、加料、物流标记', () => {
    const { goods, isNeedLogistics } = toOrderGoodsJson([
      item({ goodsId: 1, number: 2, sku: [{ optionId: 1, optionValueId: 2 }], additions: [{ pid: 5, id: 6, name: 'x' }], goodsTimesDay: 'd' }),
      item({ goodsId: 2, stores: 0, minBuyNumber: 1 }),
      item({ goodsId: 3, propertyChildIds: '9:9', logisticsId: 7 }),
    ], 88)

    expect(goods).toHaveLength(2)

    expect(goods[0]).toMatchObject({ goodsId: 1, number: 2, propertyChildIds: ',1:2', goodsAdditionList: [{ pid: 5, id: 6 }], inviter_id: 88, logisticsType: 0, goodsTimesDay: 'd', goodsTimesItem: '' })

    expect(goods[1].propertyChildIds).toBe('9:9')

    expect(isNeedLogistics).toBe(true)
  })

  it('toTableOrderGoodsJson', () => {
    expect(toTableOrderGoodsJson([item({ goodsId: 5, number: 3, sku: [{ optionId: 1, optionValueId: 1 }] })]))
      .toEqual([{ goodsId: 5, number: 3, propertyChildIds: ',1:1' }])
  })

  it('缺货与删除判断', () => {
    expect(isCartItemShortage({ minBuyNumber: 2, stores: 1 })).toBe(true)

    expect(isCartItemShortage({ stores: 0 })).toBe(false)

    expect(shouldRemoveOnChange({ minBuyNumber: 2 }, 1)).toBe(true)

    expect(shouldRemoveOnChange({}, 0)).toBe(true)

    expect(shouldRemoveOnChange({}, 1)).toBe(false)
  })
})
