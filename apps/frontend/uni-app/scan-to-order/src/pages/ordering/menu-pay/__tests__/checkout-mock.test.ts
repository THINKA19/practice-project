/** 开发接口试算与下单分离，订单列表及详情保持一致。 */
import { beforeEach, expect, it } from 'vitest'
import { checkout } from '@/pages/account/profile/order/mock/checkout'
import { profileOrderDetail, reset, rows } from '@/pages/account/profile/order/mock/state'
import { canPay, isCashOrder } from '@/pages/account/profile/order/domain/order.rules'
import { toOrderGoodsJson } from '../../menu-cart/domain/cart.rules'
import { quoteMockSku } from '../../menu/mock'

const token = 'Bearer wx-demo-session-checkout'
const payload = { shopIdZt: 1, peisongType: 'zq', goodsJsonStr: JSON.stringify([{ goodsId: 101, number: 2 }]), requestId: 'checkout-1' }
beforeEach(reset)
it('现金结算订单保持未收款，列表和详情保留标记且不展示线上支付入口', () => {
  checkout(token, { ...payload, extJsonStr: JSON.stringify({ 结算方式: '现金结算' }) })
  const order = rows(token)[0]!
  expect(order.status).toBe(0)
  expect(order.statusStr).toBe('待现金结算')
  expect(isCashOrder(order)).toBe(true)
  expect(canPay(order)).toBe(false)
  expect(profileOrderDetail(order.id, token)?.orderInfo.extJsonStr).toBe(order.extJsonStr)
  expect(canPay({ status: 0 })).toBe(true)
  expect(isCashOrder({ extJsonStr: 'bad json' })).toBe(false)
})
it('试算返回 56 商品金额且不创建订单，自取无需电话和提货点', () => {
  const count = rows(token).length
  expect(checkout(token, { ...payload, calculate: 'true' })).toMatchObject({ code: 0, data: { amountReal: 56, amountTotle: 56, amountLogistics: 0 } })
  expect(rows(token)).toHaveLength(count)
})
it('同一请求只创建一个订单，详情使用实际购买商品', () => {
  checkout(token, payload)
  const count = rows(token).length
  checkout(token, payload)
  expect(rows(token)).toHaveLength(count)
  const order = rows(token)[0]!
  expect(order.orderType).toBe('pickup')
  expect(profileOrderDetail(order.id, token)?.goods[0]).toMatchObject({ goodsId: 101, number: 2, amount: 56 })
  expect(order.countryCode).toBe('VN')
  expect(order.shopImage).toBeTruthy()
  expect(profileOrderDetail(order.id, token)?.orderInfo.shopImage).toBe(order.shopImage)
  expect(profileOrderDetail(order.id, 'Bearer wx-demo-session-other')).toBeNull()
})
it('外卖单独报价运费，缺收货资料、跨店、超库存请求被拒绝', () => {
  expect(checkout(token, { ...payload, peisongType: 'kd', calculate: 'true' }).code).not.toBe(0)
  expect(checkout(token, { ...payload, peisongType: 'kd', address: '测试地址', mobile: '12345678', linkMan: '顾客', calculate: 'true' })).toMatchObject({ code: 0, data: { amountTotle: 56, amountLogistics: 3, amountReal: 59 } })
  expect(checkout(token, { ...payload, shopIdZt: 2 }).code).not.toBe(0)
  expect(checkout(token, { ...payload, goodsJsonStr: JSON.stringify([{ goodsId: 101, number: 51 }]) }).code).not.toBe(0)
})

it.each(['zq', 'kd'])('多组规格从购物车序列化到%s试算和下单，价格与规格报价一致', (peisongType) => {
  const sku = [{ optionId: 2, optionValueId: 22 }, { optionId: 3, optionValueId: 32 }, { optionId: 4, optionValueId: 42 }]
  const goods = toOrderGoodsJson([{ key: 'meal', goodsId: 104, name: '鸡腿饭', pic: '', price: 29, number: 2, minBuyNumber: 1, stores: 60, sku }]).goods
  const input = { ...payload, peisongType, goodsJsonStr: JSON.stringify(goods), address: '测试地址', mobile: '12345678', linkMan: '顾客', requestId: `multi-${peisongType}` }
  const price = quoteMockSku(104, goods[0].propertyChildIds)
  expect(price).toBe(29)
  const count = rows(token).length
  const amountLogistics = peisongType === 'kd' ? 3 : 0
  expect(checkout(token, { ...input, calculate: 'true' })).toMatchObject({ code: 0, data: { amountTotle: 58, amountLogistics, amountReal: 58 + amountLogistics } })
  expect(rows(token)).toHaveLength(count)
  expect(checkout(token, input)).toMatchObject({ code: 0, data: { amountTotle: 58, amountReal: 58 + amountLogistics } })
  const order = rows(token).find(row => row.requestId === input.requestId)!
  expect(profileOrderDetail(order.id, token)?.goods[0]).toMatchObject({ goodsId: 104, number: 2, amountSingle: 29, amount: 58 })
})

it.each([',2:22,3:32', ',2:22,2:21,4:42', ',2:999,3:32,4:42', ',1:12', ',2:22,,3:32,4:42'])('拒绝缺失、重复或不属于商品的规格：%s', (propertyChildIds) => {
  expect(checkout(token, { ...payload, calculate: 'true', goodsJsonStr: JSON.stringify([{ goodsId: 104, number: 1, propertyChildIds }]) })).toMatchObject({ message: '商品规格无效' })
})

it('原有杯型与加料仍能正确试算', () => {
  expect(checkout(token, { ...payload, calculate: 'true', goodsJsonStr: JSON.stringify([{ goodsId: 102, number: 2, propertyChildIds: ',1:12', goodsAdditionList: [{ pid: 1, id: 1 }] }]) })).toMatchObject({ code: 0, data: { amountTotle: 34, amountReal: 34 } })
})
