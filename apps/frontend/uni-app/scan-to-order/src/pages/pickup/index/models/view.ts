import type { GoodsItem, LogisticsItem, OrderDoingItem } from './order'

export interface DoingOrderVM { order: OrderDoingItem, goods: GoodsItem[], logistics?: LogisticsItem, address: string }
