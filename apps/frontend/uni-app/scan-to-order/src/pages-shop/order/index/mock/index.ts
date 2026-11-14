import { authorize } from '@/pages-shop/auth/permissions/mock'
import { hasShopPermission } from '@/pages-shop/auth/permissions/models/policy'
import { bookings, orders } from '../../list/mock'
import { matchesCategory, orderPendingFilters } from '../../list/models/filters'
import { canUpdateBooking } from '../../list/models/booking'
import type { OrderCenterSummary } from '../models/summary'

/** Serves the order center summary from the same records as order and booking lists. */
export function summary(token: string, shopId: string) {
  const shop = authorize(token, shopId, 'order.read')
  const records = orders(token, shopId)
  const count = (category: OrderCenterSummary['category'], status: keyof typeof orderPendingFilters) =>
    records.filter(order => matchesCategory(order, category) && orderPendingFilters[status].matches(order)).length
  const items: OrderCenterSummary[] = [
    { category: 'dine-in', status: 'awaitingAcceptance', count: count('dine-in', 'awaitingAcceptance') },
    { category: 'delivery', status: 'awaitingAcceptance', count: count('delivery', 'awaitingAcceptance') },
    { category: 'pickup', status: 'awaitingVerification', count: count('pickup', 'awaitingVerification') },
  ]
  if (hasShopPermission(shop, 'booking.read')) {
    const pending = bookings(token, shopId).filter(booking => canUpdateBooking(booking.status, 'confirm'))
    items.push({ category: 'booking', status: 'awaitingConfirmation', count: pending.length })
  }
  if (shop.roleTemplate === 'owner' && hasShopPermission(shop, 'order.amount.read')) {
    items.push({ category: 'cashier', status: 'awaitingPayment', count: count('cashier', 'awaitingPayment') })
  }
  return { shopId, items }
}
