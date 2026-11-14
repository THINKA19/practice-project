import { authorize } from '@/pages-shop/auth/permissions/mock'
import { bookingActions, canUpdateBooking } from '../models/booking'
import type { BookingAction, ShopBooking } from '../models/booking'

const records = new Map<string, ShopBooking[]>()

/** Reads shop-scoped demo reservations. @example list(token, 'A') */
export function list(token: string, shopId: string) {
  authorize(token, shopId, 'booking.read')
  if (!records.has(shopId)) {
    const now = Date.now()
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed'] as const
    records.set(shopId, Array.from({ length: 24 }, (_, index) => {
      const status = statuses[index % statuses.length]
      const offset = status === 'completed' ? -index : index + 1
      return {
        id: `${shopId}-B${String(index + 1).padStart(3, '0')}`,
        shopId,
        version: 1,
        scheduledAt: new Date(now + offset * 86_400_000).toISOString(),
        customer: `测试预约顾客 ${index + 1}`,
        people: index % 6 + 2,
        status,
      }
    }))
  }
  return records.get(shopId)!.map(item => ({ ...item }))
}

/** Applies an authorized, versioned demo transition. @example update(token, { shopId: 'A', id: 'A-B001', version: 1, action: 'confirm' }) */
export function update(token: string, data: { shopId: string, id: string, version: number, action: BookingAction }) {
  authorize(token, data.shopId, 'booking.manage')
  const booking = records.get(data.shopId)?.find(item => item.id === data.id)
  if (!booking || booking.version !== data.version || !Object.prototype.hasOwnProperty.call(bookingActions, data.action) || !canUpdateBooking(booking.status, data.action))
    throw new Error('预约状态已更新或不允许此操作')
  booking.status = bookingActions[data.action].to
  booking.version++
  return { ...booking }
}
