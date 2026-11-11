/**
 * ============================================================================
 * 【文件概述】流水纯规则回归，覆盖金额、次数与非资产事件。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { cardLogAmount } from '../domain/log.rules'
 * cardLogAmount({ id: 1, amount: 10, dateAdd: '' }) // => '−¥10'
 * ============================================================================
 */
import { expect, it } from 'vitest'
import { cardLogAmount, cardLogTitle } from '../domain/log.rules'

it('事件展示区分扣减、返还和不改变资产的赠送动作', () => {
  const base = { id: 1, amount: 10, dateAdd: '' }
  expect(cardLogAmount(base)).toBe('−¥10')
  expect(cardLogAmount({ ...base, eventType: 'refund', direction: 'credit' })).toBe('+¥10')
  expect(cardLogAmount({ ...base, direction: 'none' })).toBe('—')
  expect(cardLogAmount({ ...base, amount: 1 }, 0)).toBe('−1 次')
  expect(cardLogTitle({ ...base, eventType: 'receive' })).toBe('领取礼品卡')
})
