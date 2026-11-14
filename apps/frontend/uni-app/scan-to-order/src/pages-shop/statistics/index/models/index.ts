export const PERIODS = [
  { value: 0, label: 'today' },
  { value: 7, label: 'yesterday' },
  { value: 1, label: 'last7Days' },
] as const

export const TOP_GOODS_LIMIT = 10

export function offsetDay(day: string, offset: number) {
  return new Date(Date.parse(day) + offset * 86_400_000).toISOString().slice(0, 10)
}

/** 周期 3 保留给历史查询，返回 null 表示起始日取决于数据。 */
export function periodStart(period: number, today: string) {
  if (period === 7)
    return periodEnd(period, today)
  if (period === 3)
    return null
  if (period === 4)
    return `${periodEnd(period, today).slice(0, 7)}-01`
  return offsetDay(today, 1 - ([1, 7, 30][period] ?? 1))
}

export function periodEnd(period: number, today: string) {
  if (period === 7)
    return offsetDay(today, -1)
  return period === 4 ? offsetDay(`${today.slice(0, 7)}-01`, -1) : today
}

export interface StatisticsOverview {
  /** 非取消订单的下单金额，缺少金额权限时省略。 */
  revenue?: string
  orderCount: number
  avgCustomerPrice?: string
  unitsSold?: number
  completedCount?: number
  cancelledCount?: number
}

export interface TrendPoint {
  day: string
  value: number
}

export interface TopGoodsItem {
  rank: number
  name: string
  sold: number
}

export interface StatisticsFinance {
  receivedAmount?: number
  refundedAmount?: number
  pendingAmount?: number
  paidOrderCount?: number
}

export const ORDER_CHANNELS = ['dine-in', 'delivery', 'pickup', 'booking', 'cashier'] as const

export interface StatisticsReport {
  /** 较早的服务响应可能没有返回查询日期。 */
  range?: { start: string | null, end: string }
  overview: StatisticsOverview
  trend: TrendPoint[]
  topGoods: TopGoodsItem[]
  finance?: StatisticsFinance
  coverage?: { fromOpening: boolean }
  channels?: Partial<Record<typeof ORDER_CHANNELS[number], number>>
}
