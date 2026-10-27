import type { BookingDraft } from '../models/types'
import { BOOKING_PERSON_OPTIONS } from '../models/enums'

/** 校验必填信息及当前可用的到店时间；返回 i18n key，不限定国际电话号码格式。 */
export function checkBookingDraft(f: BookingDraft, now = Date.now()): string | null {
  if (!f.name.trim()) {
    return 'booking.namePlaceholder'
  }
  if (!f.mobile.trim()) {
    return 'booking.mobilePlaceholder'
  }
  if (!Number.isInteger(f.personIndex) || f.personIndex < 0 || f.personIndex >= BOOKING_PERSON_OPTIONS.zh.length)
    return 'booking.person'
  const parts = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(f.time)
  if (!parts)
    return 'booking.timePlaceholder'
  const [, year, month, day, hour, minute] = parts.map(Number)
  const date = new Date(year, month - 1, day, hour, minute)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day
    || date.getHours() !== hour || date.getMinutes() !== minute || minute % 10 !== 0 || date.getTime() <= now) {
    return 'booking.timePlaceholder'
  }
  return null
}

/** 预约扩展信息 extJsonStr（原字段名为中文） */
export function buildBookingExt(f: BookingDraft): Record<string, string> {
  if (!Number.isInteger(f.personIndex) || !BOOKING_PERSON_OPTIONS.zh[f.personIndex])
    throw new Error('用餐人数无效')
  return {
    姓名: f.name.trim(),
    联系电话: f.mobile.trim(),
    到店时间: f.time,
    用餐人数: BOOKING_PERSON_OPTIONS.zh[f.personIndex],
  }
}

/** 将默认预约时间向上对齐到下一可用的十分钟档，避免确认未展示的分钟值。 */
export function nextBookingTime(now: number): number {
  const interval = 10 * 60 * 1000
  return Math.ceil(now / interval) * interval
}
