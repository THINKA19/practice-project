// eslint-disable-next-line project-mock/boundaries -- Existing development adapter switch.
import { USE_MOCK } from '@/mock/config'
import { http } from '@/http/alova'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import { shopText as st } from '@/locale/shop-text'
import type { BookingAction, ShopBooking } from '../models/booking'

const listEndpoint = '/operator/shop/bookings'
const actionEndpoint = '/operator/shop/booking/action'

/** Reads reservations for the authorized shop. @example await fetchShopBookings(context) */
export async function fetchShopBookings(context: ShopRequestContext): Promise<ShopBooking[]> {
  const params = { shopId: context.shopId }
  const result = import.meta.env.DEV && USE_MOCK
    // eslint-disable-next-line project-mock/boundaries -- Merchant development adapter.
    ? (await import('../mock/bookings')).list(context.token, context.shopId)
    : await http.Get<ShopBooking[]>(listEndpoint, { params, headers: { Authorization: `Bearer ${context.token}` }, cacheFor: 0, meta: { toast: false } }).send()
  if (!Array.isArray(result) || result.some(item => !item || item.shopId !== context.shopId
    || typeof item.id !== 'string' || !Number.isSafeInteger(item.version) || typeof item.customer !== 'string'
    || typeof item.scheduledAt !== 'string' || !Number.isFinite(Date.parse(item.scheduledAt))
    || !Number.isSafeInteger(item.people) || item.people < 1
    || !['pending', 'confirmed', 'cancelled', 'completed'].includes(item.status))) {
    throw new Error(st('预约数据无效'))
  }
  return result
}

/** Submits a versioned reservation transition. @example await updateShopBooking(context, booking, 'confirm') */
export async function updateShopBooking(context: ShopRequestContext, booking: ShopBooking, action: BookingAction) {
  const data = { shopId: context.shopId, id: booking.id, version: booking.version, action }
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- Merchant development adapter.
    return (await import('../mock/bookings')).update(context.token, data)
  }
  return http.Post(actionEndpoint, data, { headers: { Authorization: `Bearer ${context.token}` }, cacheFor: 0, meta: { toast: false } }).send()
}
