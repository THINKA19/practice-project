/**
 * ============================================================================
 * 门店订单响应校验
 * ============================================================================
 *
 * 【文件概述】
 * 校验列表和详情共享的基础订单字段。
 *
 * 【方法与导出清单】
 * - validateShopOrder：校验后返回门店订单。
 *
 * 【综合使用示例】
 * ```typescript
 * import { validateShopOrder } from '@/pages-shop/order/list'
 * // 接口收到响应后调用 validateShopOrder(response)
 * ```
 * ============================================================================
 */
import { shopText as st } from '@/locale/shop-text'
import type { ShopOrder } from './index'

/**
 * 校验订单响应。
 * @param value 服务端返回的订单。
 * @returns 通过校验的订单，字段无效时抛出错误。
 * @example validateShopOrder(response) // => 可用于展示的订单
 */
export function validateShopOrder(value: ShopOrder): ShopOrder {
  if (!value || typeof value.id !== 'string' || typeof value.shopId !== 'string' || !Number.isSafeInteger(value.version)
    || typeof value.createdAt !== 'string' || typeof value.tableNo !== 'string'
    || (value.pickupNumber !== undefined && typeof value.pickupNumber !== 'string')
    || (value.pickupVerificationRequired !== undefined && typeof value.pickupVerificationRequired !== 'boolean')
    || !['堂食', '外卖', '自取'].includes(value.type)
    || (value.paymentStatus !== undefined && !['unpaid', 'paid'].includes(value.paymentStatus))
    || (value.deliveryStatus !== undefined && !['delivering', 'delivered'].includes(value.deliveryStatus))
    || (value.refundStatus !== undefined && !['requested', 'processing', 'partial', 'refunded', 'rejected'].includes(value.refundStatus))
    || (value.cashier !== undefined && (typeof value.cashier?.number !== 'string' || !value.cashier.number.trim()))
    || ![1, 2, 3, 4, 5, 6].includes(value.status) || !Array.isArray(value.goods) || !Array.isArray(value.timeline)) {
    throw new Error(st('订单数据无效'))
  }
  return { ...value, time: value.createdAt }
}
