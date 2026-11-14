import { describe, expect, it } from 'vitest'
import { getBusinessSchedule } from '../composables/index/businessSchedule'

describe('店铺营业排班', () => {
  it('展示今天启用的时段，并在午休时找出当天下次营业时间', () => {
    const schedule = getBusinessSchedule([
      { day: '每日', open: '11:00', close: '14:00', on: true },
      { day: '星期六', open: '17:00', close: '21:30', on: true },
      { day: '周六', open: '14:00', close: '16:00', on: false },
      { day: '周一', open: '14:00', close: '16:00', on: true },
    ], new Date(2026, 10, 14, 14))

    expect(schedule.isOpen).toBe(false)
    expect(schedule.today.map(period => period.open)).toEqual(['11:00', '17:00'])
    expect(schedule.next?.start).toEqual(new Date(2026, 10, 14, 17))
  })

  it('把跨午夜时段计入今天，并在打烊时刻结束营业', () => {
    const hours = [{ day: '周五', open: '22:00', close: '02:00', on: true }]
    const schedule = getBusinessSchedule(hours, new Date(2026, 10, 14, 1))
    expect(schedule.isOpen).toBe(true)
    expect(schedule.today).toEqual([expect.objectContaining({ continuesFromYesterday: true })])
    expect(getBusinessSchedule(hours, new Date(2026, 10, 14, 2)).isOpen).toBe(false)
  })
})
