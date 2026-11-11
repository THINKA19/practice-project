/**
 * ============================================================================
 * 【文件概述】赠送到期回归，验证凭证生命周期与事件只记录一次。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { resetAllMocks } from '@/mock'
 * resetAllMocks() // => 清理卡包、流水与赠送状态
 * ============================================================================
 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cards } from '../../gift-card/mock'
import { shareState } from '../mock/state'
import { logState } from '../../gift-card-logs/mock'
import { resetAllMocks } from '@/mock'

beforeEach(() => resetAllMocks())
afterEach(() => {
  resetAllMocks()
  vi.useRealTimers()
})

it('赠送到期清理凭证且只产生一条过期事件', () => {
  vi.useFakeTimers()
  const card = cards('expiry').find(item => item.shareToken)!
  const token = card.shareToken!
  vi.setSystemTime(Date.now() + 86400001)
  shareState.expire()
  shareState.expire()
  expect(Boolean(shareState.get(token))).toBe(false)
  expect(card.shareToken).toBe('')
  expect(logState.read(card.id)?.filter(row => row.eventType === 'shareExpired')).toHaveLength(1)
})
