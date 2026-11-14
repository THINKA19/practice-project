import { hasShopPermission } from '@/pages-shop/auth/permissions/models/policy'
import { authorize } from '@/pages-shop/auth/permissions/mock'
import { bookings, orders } from '../list/mock'
import { orderCategories } from '../list/models/filters'

/** 仅供开发 Mock 使用。订单和预约以门店授权范围内的副本交给统计模块。 */
export function readOrderStatisticsSource(token: string, shopId: string, includeBookings: boolean) {
  const shop = authorize(token, shopId, 'statistics.read')
  const orderFacts = orders(token, shopId, 'statistics.read').map(order => ({
    createdAt: order.createdAt,
    amount: order.amount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    refundStatus: order.refundStatus,
    timeline: order.timeline,
    goods: order.goods,
    channel: orderCategories.find(category => category.type === order.type)?.key,
    cashier: Boolean(order.cashier),
  }))
  const bookingDates = includeBookings && hasShopPermission(shop, 'booking.read')
    ? bookings(token, shopId).filter(booking => booking.status !== 'cancelled').map(booking => booking.scheduledAt)
    : undefined

  return { shop, orderFacts, bookingDates }
}
