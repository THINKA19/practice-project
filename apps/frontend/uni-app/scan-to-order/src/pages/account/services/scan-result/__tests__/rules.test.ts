import { expect, it } from 'vitest'
import { canVerifyOrder, isVerificationCompleted } from '../domain/scan-result.rules'
import { normalizeVerificationCode, parseVerificationOrder } from '../models/mappers'

it('仅接收字符串码，不把 URL 参数对象转换成码', () => {
  expect(normalizeVerificationCode(' CODE ')).toBe('CODE')
  for (const value of [undefined, null, 12, ['CODE'], { hxNumber: 'CODE' }])
    expect(normalizeVerificationCode(value)).toBe('')
})

it('未知状态与制作中不可核销，已完成状态不能重复核销', () => {
  const order = { status: 1, preparing: false, amountReal: 12, goods: [] }
  expect(canVerifyOrder(order)).toBe(true)
  expect(canVerifyOrder({ ...order, status: 2 })).toBe(true)
  expect(canVerifyOrder({ ...order, preparing: true })).toBe(false)
  for (const status of [0, 3, 4, 5, -1])
    expect(canVerifyOrder({ ...order, status })).toBe(false)
  expect(isVerificationCompleted({ ...order, status: 3 })).toBe(true)
  expect(isVerificationCompleted({ ...order, status: 4 })).toBe(true)
  expect(canVerifyOrder(null)).toBe(false)
})

it('接口边界拒绝缺失金额、负金额与错误商品行', () => {
  for (const value of [null, {}, { orderInfo: {}, goods: [] }, { orderInfo: { status: 1, amountReal: -1 }, goods: [] }, { orderInfo: { status: 1, amountReal: 12 }, goods: [{ id: 1, goodsName: '商品', number: 0 }] }])
    expect(() => parseVerificationOrder(value)).toThrow()
  expect(parseVerificationOrder({ orderInfo: { status: 1, fulfillment: 'preparing', amountReal: 12 }, goods: [{ id: 1, goodsName: '商品', number: 2 }] })).toEqual({ status: 1, preparing: true, amountReal: 12, goods: [{ id: 1, goodsName: '商品', number: 2 }] })
})

it('提取二维码中的核销码，拒绝歧义参数和无效编码', () => {
  expect(normalizeVerificationCode('https://example.test/pickup?hxNumber=ABC%2D123&shopId=1')).toBe('ABC-123')
  for (const value of ['https://example.test', 'path?hxNumber=A&hxNumber=B', 'path?hxNumber=%ZZ', 'path?foo=bar'])
    expect(normalizeVerificationCode(value)).toBe('')
})
