/**
 * ============================================================================
 * 【文件概述】兑换记录回归，覆盖账户隔离、实例隔离及重置。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { createExchangeState } from '../mock/state'
 * createExchangeState().has('customer', 'GIFT-DEMO') // => false
 * ============================================================================
 */
import { expect, it } from 'vitest'
import { createExchangeState } from '../mock/state'

it('兑换码按账户隔离，reset 保留实例且清理使用记录', () => {
  const first = createExchangeState()
  const second = createExchangeState()
  first.mark('a', 'GIFT-DEMO')
  expect(first.has('a', 'GIFT-DEMO')).toBe(true)
  expect(first.has('b', 'GIFT-DEMO')).toBe(false)
  expect(second.has('a', 'GIFT-DEMO')).toBe(false)
  first.reset()
  expect(first.has('a', 'GIFT-DEMO')).toBe(false)
})
