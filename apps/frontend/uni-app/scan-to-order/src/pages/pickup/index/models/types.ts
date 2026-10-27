import type { GoodsItem, LogisticsItem, OrderDoingItem } from '@/pages/pickup/shared'

export interface DoingOrderVM { order: OrderDoingItem, goods: GoodsItem[], logistics?: LogisticsItem, address: string }
