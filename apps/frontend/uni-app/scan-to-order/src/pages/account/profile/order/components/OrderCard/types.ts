import type { Order, OrderGoods } from '../../models/types'

/** Order card input shared by its presenter and page adapter. */
export interface OrderCardVM {
  order: Order
  goods: OrderGoods[]
  statusText: string
  typeText: string
  statusClass: 'status-pending' | 'status-cancel' | 'status-success'
  showCallShop: boolean
  showDelete: boolean
  showCancel: boolean
  showRefund: boolean
  showPay: boolean
}
