/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/pickup/index/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/pickup/shared/mock/handlers'
 * ============================================================================
 */
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { pickupState } from '@/pages/pickup/shared/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[GET]${endpoints.list}`]: withFailure(({ headers }) => ok(pickupState.list(mockCustomerOwner(headers.Authorization)))),
})
