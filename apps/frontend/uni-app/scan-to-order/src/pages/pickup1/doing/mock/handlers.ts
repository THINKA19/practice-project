/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/pickup1/doing/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/pickup1/doing/mock/handlers'
 * ============================================================================
 */
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { demoPickupState } from '@/pages/pickup1/doing/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[GET]${endpoints.preview}`]: withFailure(({ headers, query }) => {
    if (query.scene === 'failure')
      return fail('演示加载失败，请切换场景或重试', 503)
    const data = demoPickupState.list(mockCustomerOwner(headers.Authorization))
    if (query.scene === 'empty')
      data.orderList = []
    else if (query.scene === 'preparing' || query.scene === 'ready')
      data.orderList = data.orderList.filter(order => order.fulfillment === query.scene)
    return ok(data)
  }),
})
