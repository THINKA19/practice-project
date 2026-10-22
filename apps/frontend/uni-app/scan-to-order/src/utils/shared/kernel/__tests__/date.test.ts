import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_STORE_TIMEZONE,
  formatDate,
  getGlobalTimezone,
  hmToMinutes,
  msUntil,
  parseDate,
  setGlobalTimezone,
} from '../date'

describe('kernel Date Service', () => {
  it('日期末尾不能被误判为时区，非法日期和时区安全返回', () => {
    expect(parseDate('2026-10-21', 'UTC')?.toISOString()).toBe('2026-10-21T00:00:00.000Z')
    expect(parseDate('2026-10-21', 'Asia/Shanghai')?.toISOString()).toBe('2026-10-20T16:00:00.000Z')
    expect(parseDate('2026-10-21T08:00:00+08:00', 'UTC')?.toISOString()).toBe('2026-10-21T00:00:00.000Z')
    expect(parseDate('invalid')).toBeNull()
    expect(parseDate('2026-10-21', 'invalid/timezone')).toBeNull()
    expect(msUntil('invalid')).toBe(0)
    expect(formatDate(0, 'YYYY-MM-DD HH:mm:ss', 'UTC')).toBe('1970-01-01 00:00:00')
    expect(formatDate(0, undefined, 'invalid/timezone')).toBe('')
  })
  beforeEach(() => {
    setGlobalTimezone(DEFAULT_STORE_TIMEZONE)
  })

  it('时区配置应该支持读取与重置', () => {
    expect(getGlobalTimezone()).toBe('Asia/Ho_Chi_Minh')
    setGlobalTimezone('Asia/Shanghai')
    expect(getGlobalTimezone()).toBe('Asia/Shanghai')
  })

  it('formatDate 能够按指定时区准确格式化时间', () => {
    // 2026-10-20 12:00:00 UTC
    const utcTime = '2026-10-20T12:00:00Z'

    // 越南时间 (UTC+7) 应为 19:00:00
    const vnFormatted = formatDate(utcTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Ho_Chi_Minh')
    expect(vnFormatted).toBe('2026-10-20 19:00:00')

    // 中国北京时间 (UTC+8) 应为 20:00:00
    const cnFormatted = formatDate(utcTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Shanghai')
    expect(cnFormatted).toBe('2026-10-20 20:00:00')
  })

  it('formatDate 空值及非法值应返回空字符串', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('invalid-date-string')).toBe('')
  })

  it('parseDate 能正确解析时区时间', () => {
    const d = parseDate('2026-10-20 12:00:00', 'Asia/Ho_Chi_Minh')
    expect(d).toBeInstanceOf(Date)
    expect(parseDate(null)).toBeNull()
    expect(parseDate('')).toBeNull()
  })

  it('msUntil 倒计时计算应准确', () => {
    const fixedNow = 1792470000000
    // 10 秒后
    const targetIso = new Date(fixedNow + 10000).toISOString()
    expect(msUntil(targetIso, fixedNow)).toBe(10000)
    expect(msUntil(null, fixedNow)).toBe(0)
  })

  it('hmToMinutes 营业时间转分钟数应准确', () => {
    expect(hmToMinutes('00:00')).toBe(0)
    expect(hmToMinutes('08:30')).toBe(510)
    expect(hmToMinutes('23:59')).toBe(1439)
    expect(Number.isNaN(hmToMinutes('invalid'))).toBe(true)
    expect(Number.isNaN(hmToMinutes(''))).toBe(true)
  })
})
