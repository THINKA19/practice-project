export interface ShopBooking {
  id: string
  shopId: string
  version: number
  scheduledAt: string
  customer: string
  people: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

export type BookingAction = 'confirm' | 'cancel' | 'complete'

export const bookingLabels = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
  completed: '已完成',
} as const

export const bookingActions = {
  confirm: { from: ['pending'], to: 'confirmed', label: '确认预约' },
  cancel: { from: ['pending', 'confirmed'], to: 'cancelled', label: '取消预约' },
  complete: { from: ['confirmed'], to: 'completed', label: '确认到店' },
} as const satisfies Record<BookingAction, { from: readonly ShopBooking['status'][], to: ShopBooking['status'], label: string }>

/** Checks whether a booking can make the requested transition. @example canUpdateBooking('pending', 'confirm') */
export function canUpdateBooking(status: ShopBooking['status'], action: BookingAction) {
  const from: readonly ShopBooking['status'][] = bookingActions[action].from
  return from.includes(status)
}
