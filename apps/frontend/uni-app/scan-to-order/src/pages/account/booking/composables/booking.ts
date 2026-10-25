import type { BookingDraft } from '../models/booking'
import { buildBookingExt } from '../models/booking'
import { bookingApi } from '../api/booking'
/** 提交预约（原 yuyueJoin { yuyueId: 系统参数 zxdz, extJsonStr }） */
export function submitBooking(yuyueId: string, f: BookingDraft) {
  return bookingApi.join({ yuyueId, extJsonStr: JSON.stringify(buildBookingExt(f)) })
}
