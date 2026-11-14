/**
 * ============================================================================
 * 门店订单详情端点
 * ============================================================================
 *
 * 【文件概述】
 * 维护详情查询、履约和打印路径。
 *
 * 【方法与导出清单】
 * - endpoints：详情、履约及打印端点。
 *
 * 【综合使用示例】
 * ```typescript
 * import { endpoints } from './api/endpoints'
 * const path = endpoints.detail // => '/operator/shop/order'
 * ```
 * ============================================================================
 */
export const endpoints = { detail: '/operator/shop/order', action: '/operator/shop/order/action', print: '/operator/shop/order/print' } as const
