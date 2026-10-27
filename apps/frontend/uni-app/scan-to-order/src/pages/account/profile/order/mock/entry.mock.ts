/** 沿用参考源码履约分类的开发订单，支持详情、取消和删除；不模拟真实扣款。 */
import { defineMock } from '@alova/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { canCancel, canDeleteInList } from '../domain/order.rules'
import { endpoints } from '../api/endpoints'

import { goodsFor, rows } from './state'
import { applyRefund, cancelRefund, refundRecords } from './refunds'

export { reset } from './state'

export default defineMock({
  [`[GET]${endpoints.refundApplyDetail}`]: withFailure(({ headers, query }) => {
    const { list } = refundRecords(headers.Authorization, query.orderId)
    return ok(list.filter(item => !query.orderGoodsId || item.baseInfo.orderGoodsId === Number(query.orderGoodsId)))
  }),
  [`[POST]${endpoints.refundApply}`]: withFailure(({ headers, data }) => applyRefund(headers.Authorization, data as Record<string, unknown>), { write: true }),
  [`[POST]${endpoints.refundApplyCancel}`]: withFailure(({ headers, data }) => cancelRefund(headers.Authorization, data as Record<string, unknown>), { write: true }),
  [`[POST]${endpoints.refundApplySetBackLogistics}`]: withFailure(() => fail('演示申请尚未通过审核，暂不支持寄回物流'), { write: true }),
  [`[POST]${endpoints.list}`]: withFailure(({ headers }) => {
    const orders = rows(headers.Authorization)
    return ok({ orderList: orders.map(row => ({ ...row })), goodsMap: Object.fromEntries(orders.map(row => [row.id, goodsFor(row)])) })
  }),
  [`[POST]${endpoints.demoAction}`]: withFailure(({ headers, data }) => {
    const input = data as { orderId?: number, action?: string }
    const row = rows(headers.Authorization).find(item => item.id === Number(input.orderId))
    if (!row || row.demo !== true)
      return fail('演示订单不存在')
    if (input.action === 'pay' && row.status === 0) {
      row.status = 1
      row.statusStr = row.orderType === 'delivery' ? '待配送' : '待取餐'
      row.isPay = true
    }
    else if (input.action === 'refund' && row.status > 0 && !row.refundStatus) {
      row.refundStatus = 1
      row.statusStr = '售后处理中'
    }
    else {
      return fail('当前订单不支持该操作')
    }
    return ok(null)
  }, { write: true }),
  [`[POST]${endpoints.close}`]: withFailure(({ headers, data }) => {
    const row = rows(headers.Authorization).find(item => item.id === Number((data as { orderId?: unknown }).orderId))
    if (!row || !canCancel(row))
      return fail('当前订单不可取消')
    row.status = -1
    row.statusStr = '已取消'
    return ok(null)
  }, { write: true }),
  [`[POST]${endpoints.remove}`]: withFailure(({ headers, data }) => {
    const list = rows(headers.Authorization)
    const index = list.findIndex(item => item.id === Number((data as { orderId?: unknown }).orderId))
    if (index < 0 || !canDeleteInList(list[index]))
      return fail('当前订单不可删除')
    list.splice(index, 1)
    return ok(null)
  }, { write: true }),
  [`[POST]${endpoints.payByBalance}`]: withFailure(() => fail('演示订单不支持余额扣款'), { write: true }),
})
