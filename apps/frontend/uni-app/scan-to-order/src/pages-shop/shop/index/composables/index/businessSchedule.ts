import type { BusinessHour } from '../../models/index'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

function appliesToDay(day: string, weekday: number) {
  const name = weekdays[weekday]
  return day === '每日' || day === `周${name}` || day === `星期${name}`
    || (weekday === 0 && (day === '周天' || day === '星期天'))
    || (day === '工作日' && weekday >= 1 && weekday <= 5)
    || (day === '周末' && (weekday === 0 || weekday === 6))
}

function timeOn(date: Date, time: string) {
  const [hour, minute] = time.split(':').map(Number)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)
}

export function localDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function getBusinessSchedule(hours: BusinessHour[], now: Date) {
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/
  const enabled = hours.filter(hour => hour.on && timePattern.test(hour.open)
    && timePattern.test(hour.close) && hour.open !== hour.close)
  const midnight = timeOn(now, '00:00')
  const tomorrow = new Date(midnight)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 昨天的跨午夜时段仍可能覆盖今天。七天后的时段用于查找下次营业。
  const intervals = Array.from({ length: 9 }, (_, index) => {
    const date = new Date(midnight)
    date.setDate(date.getDate() + index - 1)
    return enabled.filter(hour => appliesToDay(hour.day, date.getDay())).map((hour) => {
      const start = timeOn(date, hour.open)
      const end = timeOn(date, hour.close)
      const overnight = end < start
      if (overnight)
        end.setDate(end.getDate() + 1)
      return { start, end, overnight, open: hour.open, close: hour.close }
    })
  }).flat().sort((left, right) => left.start.getTime() - right.start.getTime())

  return {
    isOpen: intervals.some(({ start, end }) => start <= now && now < end),
    next: intervals.find(({ start }) => start > now),
    today: intervals.filter(({ start, end }) => start < tomorrow && end > midnight).map(interval => ({
      ...interval,
      continuesFromYesterday: interval.start < midnight,
    })),
  }
}
