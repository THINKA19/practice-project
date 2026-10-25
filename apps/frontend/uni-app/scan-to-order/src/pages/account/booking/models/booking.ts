export interface BookingForm {
  name: string
  mobile: string
  /** 预约时间 */
  time: string
  /** 人数 */
  number: number
  remark?: string
  [k: string]: string | number | undefined
}

export function validateBooking(f: BookingForm): string | null {
  if (!f.name?.trim()) {
    return 'booking.namePlaceholder'
  }
  if (!/^1\d{10}$/.test(f.mobile || '')) {
    return 'booking.mobilePlaceholder'
  }
  if (!f.time) {
    return 'booking.timePlaceholder'
  }
  return null
}

/** 用餐人数选项（原 booking/index.js persionNum，按语言列举；提交时固定使用中文） */
export const BOOKING_PERSON_OPTIONS = {
  zh: ['1-2人', '3-4人', '5-8人', '8人以上'],
  en: ['1-2 Person', '3-4 Person', '5-8 Person', 'More than 8'],
  vi: ['1-2 người', '3-4 người', '5-8 người', 'Trên 8 người'],
} as const

/** 订座表单（原页面字段：姓名、电话、到店时间、人数下标） */
export interface BookingDraft {
  name: string
  mobile: string
  time: string
  personIndex: number
}

/** 必填校验（与原实现一致，只校验非空），返回 i18n key */
export function checkBookingDraft(f: BookingDraft): string | null {
  if (!f.name) {
    return 'booking.namePlaceholder'
  }
  if (!f.mobile) {
    return 'booking.mobilePlaceholder'
  }
  if (!f.time) {
    return 'booking.timePlaceholder'
  }
  return null
}

/** 预约扩展信息 extJsonStr（原字段名为中文） */
export function buildBookingExt(f: BookingDraft): Record<string, string> {
  return {
    姓名: f.name,
    联系电话: f.mobile,
    到店时间: f.time,
    用餐人数: BOOKING_PERSON_OPTIONS.zh[f.personIndex] || BOOKING_PERSON_OPTIONS.zh[0],
  }
}

/** 将默认预约时间向上对齐到下一可用的十分钟档，避免确认未展示的分钟值。 */
export function nextBookingTime(now: number): number {
  const interval = 10 * 60 * 1000
  return Math.ceil(now / interval) * interval
}
