/**
 * ============================================================================
 * 门店订单列表公开入口
 * ============================================================================
 *
 * 【文件概述】
 * 提供详情模块所需的订单模型和通用展示规则。
 *
 * 【方法与导出清单】
 * - ShopOrder、validateShopOrder、withoutOrderAmounts、formatOrderTime、orderReference、orderStatusLabel、SHOP_ORDER_STATUS。
 *
 * 【综合使用示例】
 * ```typescript
 * import type { ShopOrder } from '@/pages-shop/order/list'
 * // 详情以 ShopOrder 表示服务端返回的订单
 * ```
 * ============================================================================
 */
export type { OrderStatus, ShopOrder } from './models'
export { withoutOrderAmounts } from './models/fulfillment'
export { formatOrderTime, orderReference, orderStatusLabel } from './models/presentation'
export { SHOP_ORDER_STATUS } from './models/status'
export { validateShopOrder } from './models/validation'
