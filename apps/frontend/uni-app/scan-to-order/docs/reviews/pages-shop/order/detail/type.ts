import type { OrderStatus } from '@/pages-shop/order/list/type'

/** 订单时间线节点 */
export interface OrderTimelineNode {
  /** 时间点（未到达时为 '—'） */
  t: string
  /** 节点文案 */
  s: string
  done: boolean
}

/** 订单详情商品行 */
export interface OrderDetailGoodsLine {
  name: string
  qty: number
  price: number
  total: number
  attr: string
}

/** 订单详情（商家视角） */
export interface ShopOrderDetail {
  orderNo: string
  status: OrderStatus
  statusText: string
  createTime: string
  payTime: string
  payMethod: string
  type: string
  tableNo: string
  people: number
  customer: { name: string, phone: string }
  goods: OrderDetailGoodsLine[]
  remark: string
  subtotal: number
  discount: number
  packFee: number
  total: number
  /** 外卖订单的配送地址 */
  address: string
  timeline: OrderTimelineNode[]
}
