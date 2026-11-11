/**
 * ============================================================================
 * 【文件概述】流水边界回归，防止畸形分页响应被当成成功。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { parseCardLogsPage } from '../models/mappers'
 * parseCardLogsPage(null) // => { result: [] }
 * ============================================================================
 */
import { expect, it } from 'vitest'
import { parseCardLogsPage } from '../models/mappers'
import { createLogState } from '../mock/state'

it('空响应兼容，畸形记录及分页必须拒绝', () => {
  expect(parseCardLogsPage(null)).toEqual({ result: [] })
  for (const value of [{}, { result: {} }, { result: [{ id: 1 }] }, { result: [], totalPage: -1 }, { result: [{ id: 1, amount: Number.NaN, dateAdd: '' }] }])
    expect(() => parseCardLogsPage(value)).toThrow()
})
it('流水实例、读取快照与 reset 相互隔离', () => {
  const first = createLogState()
  const second = createLogState()
  first.record({ id: 7, amount: 90 }, 'consume', 'debit', 10)
  const rows = first.read(7)
  rows[0].amount = 999
  expect(first.read(7)[0].amount).toBe(10)
  expect(second.read(7)).toEqual([])
  first.reset()
  expect(first.read(7)).toEqual([])
})
