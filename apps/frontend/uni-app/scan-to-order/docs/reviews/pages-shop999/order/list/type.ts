/** 订单状态：1待接单 2制作中 3待取餐/配送 4已完成 5已取消 6售后 */
export type OrderStatus = 1 | 2 | 3 | 4 | 5 | 6

/** 订单商品行 */
export interface OrderGoodsLine {
  name: string
  qty: number
  price: number
}

/** 商家订单 */
export interface ShopOrder {
  id: string
  tableNo: string
  type: '堂食' | '外卖' | '自取'
  status: OrderStatus
  statusText: string
  time: string
  goods: OrderGoodsLine[]
  amount: number
  remark: string
}
