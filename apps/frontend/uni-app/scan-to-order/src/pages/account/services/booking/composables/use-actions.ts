import type { BookingDraft } from '../models/types'
import { buildBookingExt } from '../domain/booking.rules'
import { bookingApi } from './use-requests'
/** 提交预约（原 yuyueJoin { yuyueId: 系统参数 zxdz, extJsonStr }） */
export function submitBooking(shopId: number, yuyueId: string, f: BookingDraft, requestId: string) {
  return bookingApi.join({ shopId, yuyueId, requestId, extJsonStr: JSON.stringify(buildBookingExt(f)) })
}
