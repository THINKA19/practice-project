import type { BookingDraft } from '../models/types'
import { buildBookingExt } from '../domain/booking.rules'
import { bookingApi } from './use-requests'
/** 提交预约（原 yuyueJoin { yuyueId: 系统参数 zxdz, extJsonStr }） */
export function submitBooking(yuyueId: string, f: BookingDraft) {
  return bookingApi.join({ yuyueId, extJsonStr: JSON.stringify(buildBookingExt(f)) })
}
