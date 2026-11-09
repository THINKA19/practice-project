import type { Goods } from '../models/goods.types'
import { describe, expect, it } from 'vitest'
import { categoryShopScope, goodsListAction } from '../domain/catalog.rules'

const base: Goods = {
  id: 1,
  name: '奶茶',
  pic: 'a.png',
  minPrice: 10,
  originalPrice: 12,
  minBuyNumber: 1,
  stores: 99,
  categoryId: 3,
}

describe('catalog / categoryShopScope', () => {
  it('未开启门店商品隔离时不过滤', () => {
    expect(categoryShopScope(36, '0')).toBe('')

    expect(categoryShopScope(36, '')).toBe('')
  })

  it('开启隔离时带上总部与当前门店', () => {
    expect(categoryShopScope(36, '1')).toBe('0,36')

    expect(categoryShopScope(null, '1')).toBe('0')
  })
})

describe('catalog / goodsListAction', () => {
  it('库存不足起购数量为补货中（最高优先级）', () => {
    expect(goodsListAction({ ...base, stores: 0, pingtuan: true }, null)).toBe('soldOut')
  })

  it('秒杀未开始 / 已结束', () => {
    const g = { ...base, miaosha: true }

    expect(goodsListAction(g, { startIn: 1000, endIn: 5000 })).toBe('notStart')

    expect(goodsListAction(g, { startIn: -1000, endIn: 0 })).toBe('ended')

    expect(goodsListAction(g, { startIn: -1000, endIn: 1000 })).toBe('add')
  })

  it('砍价 > 拼团 > 规格 > 直接加购', () => {
    expect(goodsListAction({ ...base, kanjia: true, pingtuan: true }, null)).toBe('kanjia')

    expect(goodsListAction({ ...base, pingtuan: true, propertyIds: '1' }, null)).toBe('pingtuan')

    expect(goodsListAction({ ...base, propertyIds: '1,2' }, null)).toBe('sku')

    expect(goodsListAction({ ...base, hasAddition: true }, null)).toBe('sku')

    expect(goodsListAction({ ...base, hasGoodsTimes: true }, null)).toBe('sku')

    expect(goodsListAction(base, null)).toBe('add')
  })
})
