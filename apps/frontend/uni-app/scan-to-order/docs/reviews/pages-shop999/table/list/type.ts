/** 桌台状态（展示映射见 @/constants/status） */
export type TableStatus = 'free' | 'using' | 'reserved' | 'cleaning'

/** 桌台 */
export interface TableItem {
  id: string
  no: string
  area: string
  seats: number
  status: TableStatus
  /** 用餐中的订单 id（用于跳订单详情） */
  orderId?: string
  orderNo?: string
  people?: number
  /** 清洁倒计时文案 */
  cleanTimer?: string
  reserveName?: string
  reserveTime?: string
}
