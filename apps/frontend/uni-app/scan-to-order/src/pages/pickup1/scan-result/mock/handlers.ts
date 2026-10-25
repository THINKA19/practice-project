/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/pickup1/scan-result/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/pickup1/scan-result/mock/handlers'
 * ============================================================================
 */
import mockGoodsImage from '@/mock/assets/images/home/banner/01.jpeg'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { defineMock } from '@alova/mock'
import type { ScanOrderDetail } from '../models/order'
import { endpoints } from '../api/endpoints'
import { createPickupOrders, pickupState } from '@/pages/pickup/index/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { createDemoOrders, demoPickupState } from '@/pages/pickup1/doing/mock'

function detail(code: string, owner: string, backend = pickupState) {
  const data = backend === demoPickupState ? createDemoOrders() : createPickupOrders()
  const order = data.orderList.find(item => item.hxNumber === code)
  if (!order)
    return fail('核销码无效', 404)
  const result: ScanOrderDetail = {
    orderInfo: { status: backend.status(owner, code), fulfillment: order.fulfillment, amount: order.amountReal, amountLogistics: 0, amountReal: order.amountReal },
    goods: (data.goodsMap[String(order.id)] ?? []).map(item => ({ ...item, pic: mockGoodsImage })),
    logistics: data.logisticsMap[String(order.id)] ?? null,
    goodsCoupons: [],
  }
  return ok(result)
}

export default defineMock({
  [`[GET]${endpoints.detail}`]: withFailure(({ query, headers }) => detail(String(query.hxNumber ?? ''), mockCustomerOwner(headers.Authorization))),
  [`[GET]${endpoints.demoDetail}`]: withFailure(({ query, headers }) => detail(String(query.hxNumber ?? ''), mockCustomerOwner(headers.Authorization), demoPickupState)),
  [`[POST]${endpoints.demoVerify}`]: withFailure(({ data, headers }) => {
    const code = data && typeof data === 'object' && 'hxNumber' in data ? String(data.hxNumber) : ''
    return demoPickupState.verify(mockCustomerOwner(headers.Authorization), code) ? ok(null) : fail('核销码无效或已核销')
  }, { write: true }),
  [`[POST]${endpoints.verify}`]: withFailure(({ data, headers }) => {
    const code = data && typeof data === 'object' && 'hxNumber' in data ? String(data.hxNumber) : ''
    return pickupState.verify(mockCustomerOwner(headers.Authorization), code) ? ok(null) : fail('核销码无效或已核销')
  }, { write: true }),
})
