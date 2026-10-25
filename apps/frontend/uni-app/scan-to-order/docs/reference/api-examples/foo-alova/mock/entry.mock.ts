/**
 * ============================================================================
 * 【文件概述】开发 Mock 专用登记入口，默认导出路由规则，可选导出状态重置。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from './entry.mock'
 * ============================================================================
 */
import { endpoints } from '../endpoints'
import { defineMock } from '@alova/mock'
import { createFoo } from './data'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

/** 对应 api/foo-alova.ts；唯一示例，后续业务模块按同样方式扩展。 */
export default defineMock({
  [`[GET]${endpoints.foo}`]: withFailure(() => ok(createFoo())),
})
