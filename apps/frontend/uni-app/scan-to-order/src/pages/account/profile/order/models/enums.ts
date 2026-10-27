import type { OrderFilter } from './types'

export const ORDER_TABS: { key: OrderFilter, label: string }[] = [
  { key: 'all', label: '全部订单' },
  { key: 'pickup', label: '到店自取' },
  { key: 'delivery', label: '外卖到家' },
  { key: 'reservation', label: '预约订单' },
  { key: 'dinein', label: '堂食订单' },
]

/**
 * 订单上下文 - 领域模型
 */

/** apifm 订单状态 */
export const OrderStatus = {
  CLOSED: -1,
  UNPAID: 0,
  /** 已支付待发货 / 待取餐 */
  PAID: 1,
  /** 已发货 / 配送中 */
  SHIPPED: 2,
  /** 待评价 */
  TO_EVALUATE: 3,
  COMPLETED: 4,
} as const
