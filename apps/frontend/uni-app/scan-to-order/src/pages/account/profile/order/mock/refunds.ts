/** 开发售后记录；按顾客与订单隔离，不产生实际退款或自动审批。 */
import type { RefundApplyRecord } from '../models/types'
import { fail, ok } from '@/mock/response'
import { canApplyRefund } from '../domain/order.rules'
import { goodsFor, rows } from './state'

const records = new WeakMap<object, RefundApplyRecord[]>()
export function refundRecords(authorization: unknown, orderId: unknown) {
  const order = rows(authorization).find(row => row.id === Number(orderId))
  if (!order)
    throw new Error('订单不存在')
  if (!records.has(order))
    records.set(order, [])
  return { order, list: records.get(order)! }
}

export function applyRefund(authorization: unknown, input: Record<string, unknown>) {
  const { order, list } = refundRecords(authorization, input.orderId)
  const goods = goodsFor(order).find(item => item.id === Number(input.orderGoodsId))
  const count = Number(input.number)
  if (!goods || !canApplyRefund(order) || !['0', '1', '2'].includes(String(input.type)) || !Number.isInteger(count) || count < 1 || count > goods.number || !String(input.reason || '').trim())
    return fail('售后申请参数无效')
  if (list.some(item => item.baseInfo.orderGoodsId === goods.id && item.baseInfo.status === 0))
    return fail('该商品已有处理中的申请')
  const amount = Number(input.type) === 2 ? 0 : Math.round(goods.amount / goods.number * count * 100) / 100
  list.push({ baseInfo: { id: order.id * 100 + list.length + 1, orderId: order.id, orderGoodsId: goods.id, number: count, type: Number(input.type), status: 0, statusStr: '等待审核（演示）', reason: String(input.reason), remark: String(input.remark || ''), amount, dateAdd: new Date().toISOString() }, pics: String(input.pic || '').split(',').filter(Boolean).map(pic => ({ pic })) })
  order.refundStatus = 1
  return ok(null)
}

export function cancelRefund(authorization: unknown, input: Record<string, unknown>) {
  const { order, list } = refundRecords(authorization, input.orderId)
  const record = list.find(item => item.baseInfo.orderGoodsId === Number(input.orderGoodsId) && item.baseInfo.status === 0)
  if (!record)
    return fail('没有可撤销的申请')
  record.baseInfo.status = -1
  record.baseInfo.statusStr = '已撤销'
  order.refundStatus = list.some(item => item.baseInfo.status === 0) ? 1 : 0
  return ok(null)
}
