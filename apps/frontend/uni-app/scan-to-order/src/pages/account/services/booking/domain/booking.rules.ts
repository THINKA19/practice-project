import { internationalPhone } from '@/utils/project/phone'
import type { BookingDraft } from '../models/types'
import { BOOKING_PERSON_OPTIONS } from '../models/enums'

/** 校验必填信息及当前可用的到店时间；返回 i18n key，电话号码按所选国家区号校验。 */
export function checkBookingDraft(f: BookingDraft, now = Date.now()): string | null {
  if (!f.name.trim()) {
    return 'booking.namePlaceholder'
  }
  if (!f.mobile.trim()) {
    return 'booking.mobilePlaceholder'
  }
  if (!internationalPhone(f.mobile, f.phoneCountry))
    return 'booking.mobileInvalid'
  if (!Number.isInteger(f.personIndex) || f.personIndex < 0 || f.personIndex >= BOOKING_PERSON_OPTIONS.zh.length)
    return 'booking.person'
  return isBookingSlot(f.time, now) ? null : 'booking.timePlaceholder'
}

/** 只允许未来七天内、从 10:00 起每两小时开始的预约时段。 */
export function isBookingSlot(time: string, now = Date.now()): boolean {
  const parts = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(time)
  if (!parts)
    return false
  const [, year, month, day, hour, minute] = parts.map(Number)
  const date = new Date(year, month - 1, day, hour, minute)
  const deadline = new Date(now)
  deadline.setDate(deadline.getDate() + 7)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    && date.getHours() === hour && date.getMinutes() === minute && minute === 0 && hour >= 10 && hour % 2 === 0
    && date.getTime() > now && date.getTime() <= deadline.getTime()
}

/** 预约扩展信息 extJsonStr（原字段名为中文） */
export function buildBookingExt(f: BookingDraft): Record<string, string> {
  if (!Number.isInteger(f.personIndex) || !BOOKING_PERSON_OPTIONS.zh[f.personIndex])
    throw new Error('用餐人数无效')
  const mobile = internationalPhone(f.mobile, f.phoneCountry)
  if (!mobile)
    throw new Error('联系电话格式不正确')
  return {
    姓名: f.name.trim(),
    联系电话: mobile,
    到店时间: f.time,
    用餐人数: BOOKING_PERSON_OPTIONS.zh[f.personIndex],
  }
}

/** 将已校验的偶数整点起始时段显示为两小时区间。 */
export function formatBookingSlot(slot: string): string {
  if (!slot)
    return ''
  const start = Number(slot.slice(11, 13))
  const end = start + 2
  return `${slot.slice(11)}–${String(end).padStart(2, '0')}:00`
}
