import { describe, expect, it } from 'vitest'
import { isSignedOn } from '../index'
import { parseSignLogs } from '../models/mappers'

it('日志缺失或字段损坏不能作为未签到处理', () => {
  for (const value of [undefined, null, {}, { result: null }, { result: [{ id: 1, dateAdd: 123 }] }])
    expect(() => parseSignLogs(value)).toThrow()
  expect(parseSignLogs({ result: [] })).toEqual([])
})

describe('member.isSignedOn', () => {
  const logs = [{ id: 1, dateAdd: '2026-10-05 08:00:00' }, { id: 2, dateAdd: '2026-10-07 09:12:00' }]
  it('按 YYYY-MM-DD 前缀匹配', () => {
    expect(isSignedOn(logs, new Date(2026, 9, 5))).toBe(true)
    expect(isSignedOn(logs, new Date(2026, 9, 6))).toBe(false)
    expect(isSignedOn(logs, new Date(2026, 9, 7, 23, 59))).toBe(true)
  })
})
