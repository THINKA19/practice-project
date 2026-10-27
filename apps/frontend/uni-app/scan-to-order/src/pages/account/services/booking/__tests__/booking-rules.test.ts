import { describe, expect, it } from 'vitest'
import { buildBookingExt, checkBookingDraft, nextBookingTime } from '../domain/booking.rules'

describe('booking', () => {
  const draft = { name: '张三', mobile: '123', time: '2099-01-01 12:00', personIndex: 1 }

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
      到店时间: '2099-01-01 12:00',
      用餐人数: '3-4人',
    })
  })
})

it('aligns the initial appointment to a valid ten-minute option, including day rollover', () => {
  expect(nextBookingTime(Date.UTC(2026, 9, 24, 12, 28, 45))).toBe(Date.UTC(2026, 9, 24, 12, 30))
  expect(nextBookingTime(Date.UTC(2026, 9, 24, 23, 58))).toBe(Date.UTC(2026, 9, 25, 0, 0))
})

it('rejects blank contacts, invalid dates, past slots and hidden minute values', () => {
  const now = new Date(2026, 9, 25, 12, 0).getTime()
  const draft = { name: '张三', mobile: '+66 12345678', time: '2026-10-25 12:10', personIndex: 0 }
  expect(checkBookingDraft(draft, now)).toBeNull()
  expect(checkBookingDraft({ ...draft, name: '  ' }, now)).toBe('booking.namePlaceholder')
  expect(checkBookingDraft({ ...draft, mobile: '  ' }, now)).toBe('booking.mobilePlaceholder')
  for (const time of ['2026-10-25 11:50', '2026-10-25 12:00', '2026-02-30 12:10', '2026-10-25 12:13', 'invalid'])
    expect(checkBookingDraft({ ...draft, time }, now)).toBe('booking.timePlaceholder')
})

it.each([-1, 4, 1.5, Number.NaN])('rejects invalid party index %s instead of silently choosing two people', (personIndex) => {
  const draft = { name: '张三', mobile: '+66 123', time: '2099-01-01 12:00', personIndex }
  expect(checkBookingDraft(draft)).toBe('booking.person')
  expect(() => buildBookingExt(draft)).toThrow('用餐人数无效')
})
