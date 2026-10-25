import { describe, expect, it } from 'vitest'
import { buildBookingExt, checkBookingDraft, nextBookingTime } from '../models/booking'

describe('booking', () => {
  const draft = { name: '张三', mobile: '123', time: '2024-01-01 12:00', personIndex: 1 }

  it('checks required fields in order', () => {
    expect(checkBookingDraft({ ...draft, name: '' })).toBe('booking.namePlaceholder')
    expect(checkBookingDraft({ ...draft, mobile: '' })).toBe('booking.mobilePlaceholder')
    expect(checkBookingDraft({ ...draft, time: '' })).toBe('booking.timePlaceholder')
    expect(checkBookingDraft(draft)).toBeNull()
  })

  it('builds ext with chinese person option', () => {
    expect(buildBookingExt(draft)).toEqual({
      姓名: '张三',
      联系电话: '123',
      到店时间: '2024-01-01 12:00',
      用餐人数: '3-4人',
    })
  })
})

it('aligns the initial appointment to a valid ten-minute option, including day rollover', () => {
  expect(nextBookingTime(Date.UTC(2026, 9, 24, 12, 28, 45))).toBe(Date.UTC(2026, 9, 24, 12, 30))
  expect(nextBookingTime(Date.UTC(2026, 9, 24, 23, 58))).toBe(Date.UTC(2026, 9, 25, 0, 0))
})
