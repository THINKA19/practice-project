import type { AdditionGroup, GoodsDetail, TimeScheduleDay } from '@/pages/ordering/menu'
import { describe, expect, it } from 'vitest'
import { buildAdditionPayload, buildSkuPayload, computeBadges, emptySelection, isAdditionComplete, isSkuComplete, propertyChildIds, quotePrice, selectProperty, selectTimeSlot, toggleAddition } from '@/pages/ordering/menu'

const detail: GoodsDetail = {
  basicInfo: { id: 1, name: '奶茶', pic: 'a.png', minPrice: 10, originalPrice: 12, minBuyNumber: 1, stores: 99, categoryId: 3 },
  properties: [
    { id: 1, name: '杯型', childsCurGoods: [{ id: 11, name: '中杯' }, { id: 12, name: '大杯' }] },
    { id: 2, name: '温度', childsCurGoods: [{ id: 21, name: '少冰' }] },
  ],
}

const additions: AdditionGroup[] = [
  { id: 100, name: '小料', type: 0, required: true, items: [{ id: 1, pid: 100, name: '珍珠', price: 1.1 }, { id: 2, pid: 100, name: '椰果', price: 2.2 }] },
  { id: 200, name: '加份', type: 1, required: false, items: [{ id: 3, pid: 200, name: '奶盖', price: 3 }] },
]
describe('catalog / sku selection', () => {
  it('需要选全规格才能提交', () => {
    let sel = selectProperty(emptySelection(), 1, 12)

    expect(isSkuComplete(detail, sel, null)).toBe(false)

    sel = selectProperty(sel, 2, 21)

    expect(isSkuComplete(detail, sel, null)).toBe(true)

    expect(propertyChildIds(detail, sel)).toBe('1:12,2:21,')

    expect(buildSkuPayload(detail, sel, true)[0]).toEqual({ optionId: 1, optionValueId: 12, optionName: '杯型', optionValueName: '大杯' })
  })

  it('单选加料互斥，再次点击取消', () => {
    let sel = toggleAddition(emptySelection(), additions[0], additions[0].items[0])

    sel = toggleAddition(sel, additions[0], additions[0].items[1])

    expect(sel.additions).toEqual(['100-2'])

    expect(isAdditionComplete(additions, sel)).toBe(true)

    sel = toggleAddition(sel, additions[0], additions[0].items[1])

    expect(isAdditionComplete(additions, sel)).toBe(false)
  })

  it('价格 = 时段价 + 加料（无浮点误差）', () => {
    const schedule: TimeScheduleDay[] = [{ day: '2026-10-05', items: [{ name: '午市', price: 8.8, stores: 0 }, { name: '晚市', price: 9.9, stores: 5 }] }]

    let sel = selectTimeSlot(emptySelection(), schedule, 0, 0)

    expect(sel.time).toBeNull()
    // 无库存不可选

    sel = selectTimeSlot(sel, schedule, 0, 1)

    sel = toggleAddition(sel, additions[0], additions[0].items[0])

    sel = toggleAddition(sel, additions[1], additions[1].items[0])

    const q = quotePrice({ detail, sel, schedule, additions })

    expect(q.price).toBe(14)

    expect(q.maxBuy).toBe(5)

    expect(buildAdditionPayload(additions, sel)).toEqual([{ id: 1, pid: 100 }, { id: 3, pid: 200 }])
  })

  it('购物车徽章按分类与商品累计', () => {
    const r = computeBadges([{ goodsId: 1, categoryId: 3, number: 2 }, { goodsId: 2, categoryId: 3, number: 1 }])

    expect(r.byCategory[3]).toBe(3)

    expect(r.byGoods[1]).toBe(2)
  })
})
