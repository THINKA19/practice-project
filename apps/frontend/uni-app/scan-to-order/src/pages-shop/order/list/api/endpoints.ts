/**
 * ============================================================================
 * 门店订单列表端点
 * ============================================================================
 *
 * 【文件概述】
 * 维护列表查询路径。
 *
 * 【方法与导出清单】
 * - endpoints.list：订单列表接口。
 *
 * 【综合使用示例】
 * ```typescript
 * import { endpoints } from './api/endpoints'
 * const path = endpoints.list // => '/operator/shop/orders'
 * ```
 * ============================================================================
 */
export const endpoints = { list: '/operator/shop/orders' } as const
