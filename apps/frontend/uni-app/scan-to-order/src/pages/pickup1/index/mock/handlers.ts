/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/pickup1/index/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/pickup1/index/mock/handlers'
 * ============================================================================
 */
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { createOrderDetail, createPickupPreview, createShop } from './data'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[GET]${endpoints.preview}`]: withFailure(({ query }) => {
    const scene = query.scene
    return ok(createPickupPreview(scene === 'delivery' || scene === 'unpaid' || scene === 'finished' ? scene : 'pickup'))
  }),
  [`[POST]${endpoints.demoPay}`]: withFailure(() => ok(createPickupPreview('pickup')), { write: true }),
  [`[GET]${endpoints.detail}`]: withFailure(({ query, headers }) => {
    const detail = createOrderDetail(String(query.id ?? ''), mockCustomerOwner(headers.Authorization))
    return detail ? ok(detail) : fail('订单不存在', 404)
  }),
  [`[GET]${endpoints.shop}`]: withFailure(({ query }) => String(query.id) === '1' ? ok(createShop()) : fail('门店不存在', 404)),
})
