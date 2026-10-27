import type { RefundableGoods, RefundApply } from '../models/types'
import { describe, expect, it } from 'vitest'
import { attachRefundGoods, buildReputationPostJson, canApplyRefund, canCallShop, canDeleteInList, fullAddress, logisticsOf, orderIdFromPayNextAction, orderListStatusKey } from '../domain/order.rules'

describe('order list rules（all-orders）', () => {
  it('状态文案 key 与原 doneShow 一致', () => {
    expect(orderListStatusKey({ status: -1 })).toBe('order.status.st01')
    expect(orderListStatusKey({ status: 1, isNeedLogistics: true })).toBe('order.status.st11')
    expect(orderListStatusKey({ status: 1, isNeedLogistics: false })).toBe('order.status.st10')
    expect(orderListStatusKey({ status: 3 })).toBe('order.status.st3')
    expect(orderListStatusKey({ status: 0 })).toBe('')
    expect(orderListStatusKey({ status: 4 })).toBe('')
  })

  it('按钮显隐与 wxml 一致', () => {
    expect(canCallShop({ status: 0 })).toBe(false)
    expect(canCallShop({ status: 1 })).toBe(true)
    expect(canDeleteInList({ status: -1 })).toBe(true)
    expect(canDeleteInList({ status: 2 })).toBe(false)
    expect(canDeleteInList({ status: 3 })).toBe(false)
    expect(canDeleteInList({ status: 4 })).toBe(true)
    expect(canApplyRefund({ status: -1 })).toBe(false)
    expect(canApplyRefund({ status: 2 })).toBe(true)
  })

  it('logisticsMap 取值与地址拼接', () => {
    const map = { 12: { linkMan: 'A', provinceStr: '浙江', cityStr: '杭州', areaStr: '西湖', address: '1号' } }
    expect(logisticsOf(map, 12)?.linkMan).toBe('A')
    expect(logisticsOf(map, 13)).toBeUndefined()
    expect(logisticsOf(null, 12)).toBeUndefined()
    expect(fullAddress(logisticsOf(map, 12))).toBe('浙江杭州西湖1号')
    expect(fullAddress(logisticsOf(map, 12), ' ')).toBe('浙江 杭州 西湖 1号')
  })
})

describe('order detail rules', () => {
  it('支付记录 nextAction 解析订单 id', () => {
    expect(orderIdFromPayNextAction('{"type":0,"id":99}')).toBe(99)
    expect(orderIdFromPayNextAction('{"type":"0","id":"99"}')).toBe('99')
    expect(orderIdFromPayNextAction('{"type":4,"uid":1}')).toBeNull()
    expect(orderIdFromPayNextAction('')).toBeNull()
    expect(orderIdFromPayNextAction('bad json')).toBeNull()
  })

  it('评价 postJsonString 结构', () => {
    const json = buildReputationPostJson('tk', 5, [{ id: 1, reputation: 2, remark: '好' }])
    expect(JSON.parse(json)).toEqual({ token: 'tk', orderId: 5, reputations: [{ id: 1, reputation: 2, remark: '好' }] })
  })
})

describe('售后记录关联商品', () => {
  it('按订单商品 id 关联', () => {
    const goods = [{ id: 7, goodsId: 1, goodsName: '奶茶', pic: 'p', number: 1, amount: 10 }] as RefundableGoods[]
    const list = [{ baseInfo: { id: 1, status: 0, type: 0, orderGoodsId: 7 }, pics: [{ pic: 'a' }] }] as unknown as RefundApply[]
    const rec = attachRefundGoods(list, goods)
    expect(rec[0].goodInfo?.goodsName).toBe('奶茶')
    expect(attachRefundGoods(null, goods)).toEqual([])
  })
})
