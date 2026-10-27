import type { SignLog } from '../models/types'

/** 今天是否已签到（签到日志按日期判断） */
export function hasSignedToday(logs: SignLog[], now = new Date()): boolean {
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  const d = now.getDate()
  const today = `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`
  return logs.some(l => (l.dateAdd || '').startsWith(today))
}

/** 按本地日期生成 YYYY-MM-DD，用于和接口签到日期逐日比较。 */
export function ymd(date: Date) {
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${date.getFullYear()}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`
}

/** 指定日期是否已签到（原 sign formatter：dateAdd 以 YYYY-MM-DD 开头） */
export function isSignedOn(logs: SignLog[], date: Date): boolean {
  const day = ymd(date)
  return logs.some(l => (l.dateAdd || '').startsWith(day))
}
