import type { StatisticsReport } from '../models/index'
import { merchantClock } from '@/pages-shop/auth/permissions'
import { readOrderStatisticsSource } from '@/pages-shop/order/mock'
import { endpoints } from '../api/endpoints'
import { offsetDay, periodEnd, periodStart, TOP_GOODS_LIMIT } from '../models/index'

/** 按当前门店和当地业务日聚合开发环境订单。 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string): StatisticsReport {
  const period = Number(data.period)
  if (endpoint !== endpoints.overview || ![0, 1, 2, 3, 4, 7].includes(period))
    throw new Error('统计周期无效')

  const shopId = String(data.shopId)
  const history = period === 3
  const { shop, orderFacts, bookingDates } = readOrderStatisticsSource(token, shopId, !history)
  const clock = merchantClock(shop)
  const now = new Date()
  const today = clock(now).day
  const firstDay = periodStart(period, today)
  const end = periodEnd(period, today)
  const goods = new Map<string, { name: string, sold: number }>()
  const totals = new Map<string, number>()
  const channels = { 'dine-in': 0, 'delivery': 0, 'pickup': 0, 'cashier': 0 }
  let start = firstDay
  let total = 0
  let count = 0
  let unitsSold = 0
  let completedCount = 0
  let cancelledCount = 0
  const canReadAmounts = shop.permissions.includes('order.amount.read')
  let hasAmounts = canReadAmounts
  let hasPendingAmount = canReadAmounts && shop.roleTemplate === 'owner'
  let pendingCents = 0
  let receivedCents = 0
  let refundedCents = 0
  let paidOrderCount = 0
  const hasFinanceScope = canReadAmounts && shop.roleTemplate === 'owner'

  function inPeriod(day: string) {
    return day <= end && (!firstDay || day >= firstDay)
  }

  function occurredInPeriod(timestamp: string) {
    const occurred = new Date(timestamp)
    return Number.isFinite(occurred.getTime()) && occurred <= now && inPeriod(clock(occurred).day)
  }

  for (const order of orderFacts) {
    const date = new Date(order.createdAt)
    if (!Number.isFinite(date.getTime()))
      continue

    const { day } = clock(date)
    const cents = Math.round((order.amount ?? 0) * 100)
    if (hasFinanceScope && order.amount !== undefined) {
      const collected = order.timeline.find(event => event.done && event.s === '已收款')
      const refunded = order.timeline.find(event => event.done && event.s === '已退款')
      if (collected && occurredInPeriod(collected.t)) {
        receivedCents += cents
        paidOrderCount++
      }
      if (refunded && order.refundStatus === 'refunded' && occurredInPeriod(refunded.t))
        refundedCents += cents
    }
    if (date <= now && order.status !== 5 && order.status !== 6 && order.paymentStatus !== 'paid') {
      hasPendingAmount = hasPendingAmount && order.paymentStatus === 'unpaid' && order.amount !== undefined
      pendingCents += cents
    }
    if (!inPeriod(day))
      continue

    if (history && (!start || day < start))
      start = day
    if (order.status === 5) {
      cancelledCount++
      continue
    }

    count++
    if (order.channel && order.channel !== 'booking')
      channels[order.channel]++
    if (order.cashier)
      channels.cashier++
    if (order.status === 4)
      completedCount++
    hasAmounts = hasAmounts && order.amount !== undefined
    total += cents
    totals.set(day, (totals.get(day) ?? 0) + cents)

    for (const line of order.goods) {
      if (line.qty <= 0)
        continue
      const key = line.productId == null ? `name:${line.name}` : `id:${line.productId}`
      const item = goods.get(key) ?? { name: line.name, sold: 0 }
      item.sold += line.qty
      unitsSold += line.qty
      goods.set(key, item)
    }
  }

  const dates = firstDay ? [] : [...totals.keys()].sort()
  for (let day = firstDay; day && day <= end; day = offsetDay(day, 1))
    dates.push(day)

  const bookingCount = bookingDates?.filter(date => inPeriod(clock(new Date(date)).day)).length

  return {
    channels: {
      'dine-in': channels['dine-in'],
      'delivery': channels.delivery,
      'pickup': channels.pickup,
      ...(hasFinanceScope ? { cashier: channels.cashier } : {}),
      ...(bookingCount !== undefined ? { booking: bookingCount } : {}),
    },
    range: { start, end },
    overview: {
      orderCount: count,
      unitsSold,
      completedCount,
      cancelledCount,
      ...(hasAmounts
        ? {
            revenue: (total / 100).toFixed(2),
            avgCustomerPrice: (count ? total / 100 / count : 0).toFixed(2),
          }
        : {}),
    },
    trend: hasAmounts ? dates.map(day => ({ day, value: (totals.get(day) ?? 0) / 100 })) : [],
    ...(hasFinanceScope
      ? {
          finance: {
            receivedAmount: receivedCents / 100,
            refundedAmount: refundedCents / 100,
            paidOrderCount,
            ...(hasPendingAmount ? { pendingAmount: pendingCents / 100 } : {}),
          },
        }
      : {}),
    topGoods: Array.from(goods.values())
      .sort((a, b) => b.sold - a.sold || a.name.localeCompare(b.name))
      .slice(0, TOP_GOODS_LIMIT)
      .map((item, index) => ({ ...item, rank: index + 1 })),
  }
}
