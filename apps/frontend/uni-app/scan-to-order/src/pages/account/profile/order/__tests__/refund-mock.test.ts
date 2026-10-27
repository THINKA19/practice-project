import { beforeEach, expect, it } from 'vitest'
import { applyRefund, cancelRefund, refundRecords } from '../mock/refunds'
import { goodsFor, reset, rows } from '../mock/state'

const owner = 'Bearer wx-demo-session-refund-owner'
beforeEach(reset)
it('售后申请按订单和账户隔离，拒绝重复提交，撤销后更新订单', () => {
  const order = rows(owner).find(row => row.id === 1003)!
  const goods = goodsFor(order)[0]
  const input = { orderId: order.id, orderGoodsId: goods.id, type: '0', number: 1, amount: 999, reason: '质量问题' }
  applyRefund(owner, input)
  const { list } = refundRecords(owner, order.id)
  expect(list).toHaveLength(1)
  expect(list[0].baseInfo.amount).not.toBe(999)
  applyRefund(owner, input)
  expect(list).toHaveLength(1)
  expect(refundRecords('Bearer wx-demo-session-refund-other', order.id).list).toHaveLength(0)
  cancelRefund(owner, input)
  expect(list[0].baseInfo.status).toBe(-1)
  expect(order.refundStatus).toBe(0)
})
