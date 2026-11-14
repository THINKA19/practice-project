/**
 * ============================================================================
 * 门店订单模型
 * ============================================================================
 *
 * 【文件概述】
 * 定义订单列表和订单详情所使用的领域契约。
 *
 * 【方法与导出清单】
 * - OrderStatus、OrderGoodsLine、ShopOrder：订单状态、商品行与订单数据。
 *
 * 【综合使用示例】
 * ```typescript
 * import type { OrderStatus } from '@/pages-shop/order/list/models'
 * const ready: OrderStatus = 3
 * ```
 * ============================================================================
 */
/** 订单状态：1待接单 2制作中 3待取餐/配送 4已完成 5已取消 6售后 */
export type OrderStatus = 1 | 2 | 3 | 4 | 5 | 6

/** 订单商品行 */
export interface OrderGoodsLine {
  productId?: string | number
  name: string
  qty: number
  price?: number
}

/** 商家订单 */
export interface ShopOrder {
  id: string
  shopId: string
  version: number
  createdAt: string
  address: string
  customer: string
  phone: string
  timeline: { t: string, s: string, done: boolean }[]
  tableNo: string
  /** 用于人工对单的公开展示号。 */
  pickupNumber?: string
  pickupVerificationRequired?: boolean
  type: '堂食' | '外卖' | '自取'
  paymentStatus?: 'unpaid' | 'paid'
  deliveryStatus?: 'delivering' | 'delivered'
  refundStatus?: 'requested' | 'processing' | 'partial' | 'refunded' | 'rejected'
  cashier?: { number: string }
  status: OrderStatus
  statusText: string
  time: string
  goods: OrderGoodsLine[]
  amount?: number
  remark: string
}
