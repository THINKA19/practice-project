/**
 * ============================================================================
 * 门店订单履约范围
 * ============================================================================
 *
 * 【文件概述】
 * 保留员工可执行的订单状态与可见字段。
 *
 * 【方法与导出清单】
 * - isFulfillmentOrder：判断待处理订单。
 * - withoutOrderAmounts：生成不含金额的订单。
 *
 * 【综合使用示例】
 * ```typescript
 * import { isFulfillmentOrder } from './models/fulfillment'
 * // 在订单列表中使用 orders.filter(isFulfillmentOrder)
 * ```
 * ============================================================================
 */
import type { ShopOrder } from './index'

export function isFulfillmentOrder(order: ShopOrder) {
  return order.status >= 1 && order.status <= 3
}

export function withoutOrderAmounts(order: ShopOrder): ShopOrder {
  return {
    id: order.id,
    shopId: order.shopId,
    version: order.version,
    createdAt: order.createdAt,
    address: order.address,
    customer: order.customer,
    phone: order.phone,
    timeline: order.timeline.map(({ t, s, done }) => ({ t, s, done })),
    tableNo: order.tableNo,
    pickupNumber: order.pickupNumber,
    pickupVerificationRequired: order.pickupVerificationRequired,
    type: order.type,
    deliveryStatus: order.deliveryStatus,
    status: order.status,
    statusText: order.statusText,
    time: order.time,
    goods: order.goods.map(({ name, qty, productId }) => ({
      name,
      qty,
      ...(productId === undefined ? {} : { productId }),
    })),
    remark: order.remark,
  }
}
