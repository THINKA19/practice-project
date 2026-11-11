/**
 * ============================================================================
 * 【文件概述】卡包资产展示规则回归，过期及耗尽不能展示为可赠送。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { myCardState } from '../domain/card.rules'
 * myCardState({ id: 1, cardId: 1, amount: 0, status: 0 }) // => 'empty'
 * ============================================================================
 */
import { expect, it } from 'vitest'
import { myCardState } from '../domain/card.rules'

it('过期卡和耗尽卡不能显示为可赠送', () => {
  const base = { id: 1, cardId: 1, amount: 10, status: 0 }
  expect(myCardState({ ...base, dateEnd: '2000-01-01' })).toBe('expired')
  expect(myCardState({ ...base, amount: 0 })).toBe('empty')
})
