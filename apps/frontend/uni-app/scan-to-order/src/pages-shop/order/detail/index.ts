/**
 * ============================================================================
 * 门店订单详情公开入口
 * ============================================================================
 *
 * 【文件概述】
 * 对列表页开放同一套履约操作。
 *
 * 【方法与导出清单】
 * - useOrderActions：执行接单、取消、出餐和交付。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useOrderActions } from '@/pages-shop/order/detail'
 * const actions = useOrderActions(findOrder, refresh)
 * ```
 * ============================================================================
 */
export { useOrderActions } from './composables/useOrderActions'
