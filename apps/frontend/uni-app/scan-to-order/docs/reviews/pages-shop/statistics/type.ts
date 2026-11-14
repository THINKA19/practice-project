/** 核心指标概览 */
export interface StatisticsOverview {
  revenue: string
  orderCount: number
  customerCount: number
  avgCustomerPrice: string
  refund: string
  newMembers: number
}

/** 营业额趋势点 */
export interface TrendPoint {
  day: string
  value: number
}

/** 热销商品 */
export interface TopGoodsItem {
  rank: number
  name: string
  sold: number
  amount: number
  pct: number
}

/** 订单时段分布点 */
export interface HourDistPoint {
  h: string
  v: number
}

/** 支付方式占比 */
export interface PayMixItem {
  name: string
  value: number
  amount: string
}
