/**
 * ============================================================================
 * 【文件概述】领取预览边界回归，空结果与错误卡片不能解锁领取。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { parseSharePreview } from '../models/mappers'
 * // 空结果必须抛错，由页面显示重试。
 * ============================================================================
 */
import { expect, it } from 'vitest'
import { parseSharePreview } from '../models/mappers'

it('拒绝空预览、缺少持卡事实和模板不匹配', () => {
  for (const value of [null, {}, { cardInfo: { id: 1 } }, { cardUser: { id: 1, cardId: 2, amount: 10, status: 0 }, cardInfo: { id: 1, name: '卡', amount: 10 } }])
    expect(() => parseSharePreview(value)).toThrow()
})
it('有效预览复制持卡和模板，不修改原始响应', () => {
  const value = { cardUser: { id: 1, cardId: 2, amount: 10, status: 0 }, cardInfo: { id: 2, name: '卡', amount: 10 } }
  const parsed = parseSharePreview(value)
  parsed.cardInfo.name = '修改'
  expect(value.cardInfo.name).toBe('卡')
})
