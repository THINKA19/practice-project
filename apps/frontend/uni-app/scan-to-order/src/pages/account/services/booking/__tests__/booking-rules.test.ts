import { describe, expect, it } from 'vitest'
import { buildBookingExt, checkBookingDraft, formatBookingSlot } from '../domain/booking.rules'

describe('booking', () => {
  const draft = { name: '张三', mobile: '0912345678', phoneCountry: 'VN', time: '2099-01-01 12:00', personIndex: 1 }

  it('checks required fields in order', () => {
    expect(checkBookingDraft({ ...draft, name: '' })).toBe('booking.namePlaceholder')
    expect(checkBookingDraft({ ...draft, mobile: '' })).toBe('booking.mobilePlaceholder')
    expect(checkBookingDraft({ ...draft, time: '' })).toBe('booking.timePlaceholder')
    expect(checkBookingDraft(draft, new Date(2098, 11, 31).getTime())).toBeNull()
  })

  it('builds ext with chinese person option', () => {
    expect(buildBookingExt(draft)).toEqual({
      姓名: '张三',
      联系电话: '+84912345678',
      到店时间: '2099-01-01 12:00',
      用餐人数: '3-4人',
    })
  })
})

it('formats two-hour windows, from opening through end of day', () => {
  expect(formatBookingSlot('2026-10-25 12:00')).toBe('12:00–14:00')
  expect(formatBookingSlot('2026-10-25 22:00')).toBe('22:00–24:00')
  expect(formatBookingSlot('2026-10-25 10:00')).toBe('10:00–12:00')
})

it('rejects blank contacts, invalid dates, past slots and hidden minute values', () => {
  const now = new Date(2026, 9, 25, 12, 0).getTime()
  const draft = { name: '张三', mobile: '+66 812345678', phoneCountry: 'TH', time: '2026-10-25 14:00', personIndex: 0 }
  expect(checkBookingDraft(draft, now)).toBeNull()
  expect(checkBookingDraft({ ...draft, name: '  ' }, now)).toBe('booking.namePlaceholder')
  expect(checkBookingDraft({ ...draft, mobile: '  ' }, now)).toBe('booking.mobilePlaceholder')
  for (const time of ['2026-10-25 11:50', '2026-10-25 12:00', '2026-02-30 12:10', '2026-10-25 12:13', '2026-10-25 13:00', 'invalid'])
    expect(checkBookingDraft({ ...draft, time }, now)).toBe('booking.timePlaceholder')
})

it.each([-1, 4, 1.5, Number.NaN])('rejects invalid party index %s instead of silently choosing two people', (personIndex) => {
  const draft = { name: '张三', mobile: '+66 812345678', phoneCountry: 'TH', time: '2099-01-01 12:00', personIndex }
  expect(checkBookingDraft(draft)).toBe('booking.person')
  expect(() => buildBookingExt(draft)).toThrow('用餐人数无效')
})

it('accepts the seven-day boundary and rejects the next slot', () => {
  const now = new Date(2026, 9, 25, 12, 0).getTime()
  const draft = { name: '张三', mobile: '0912345678', phoneCountry: 'VN', time: '2026-11-01 12:00', personIndex: 0 }
  expect(checkBookingDraft(draft, now)).toBeNull()
  expect(checkBookingDraft({ ...draft, time: '2026-11-01 14:00' }, now)).toBe('booking.timePlaceholder')
})

it('accepts the first dining slot and rejects earlier slots', () => {
  const now = new Date(2026, 9, 25, 7).getTime()
  const draft = { name: '张三', mobile: '0912345678', phoneCountry: 'VN', time: '2026-10-25 10:00', personIndex: 0 }
  expect(checkBookingDraft(draft, now)).toBeNull()
  expect(checkBookingDraft({ ...draft, time: '2026-10-25 08:00' }, now)).toBe('booking.timePlaceholder')
})

it('rejects scientific notation and mismatched country codes', () => {
  const draft = { name: '张三', mobile: '-2e-18', phoneCountry: 'CN', time: '2099-01-01 12:00', personIndex: 0 }
  expect(checkBookingDraft(draft)).toBe('booking.mobileInvalid')
  expect(checkBookingDraft({ ...draft, mobile: '+84912345678' })).toBe('booking.mobileInvalid')
  expect(() => buildBookingExt(draft)).toThrow('联系电话格式不正确')
})
