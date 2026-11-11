/**
 * ============================================================================
 * 【文件概述】领取领域拥有的跨模块链路回归：真实 Alova Mock 请求、分页、兑换、赠送、撤回及资产转移。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { resetAllMocks } from '@/mock'
 * resetAllMocks() // => 每次测试清理各领域自己的状态
 * ============================================================================
 */
import { effectScope } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
vi.mock('vue-i18n', async importOriginal => ({
  ...await importOriginal<typeof import('vue-i18n')>(),
  useI18n: () => ({ t: (key: string) => key }),
}))
vi.mock('@/utils/project/interaction', async importOriginal => ({
  ...await importOriginal<typeof import('@/utils/project/interaction')>(),
  alert: vi.fn().mockResolvedValue(undefined),
}))
afterEach(() => vi.unstubAllEnvs())
it('通过真实请求链验证礼品卡消费分页、账户隔离、兑换、赠送与领取', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { seedSession } = await import('@/pages/auth/session/__tests__/fixtures')
  const session = seedSession()
  session.snapshot!.tokenInfo = { token: 'wx-demo-session-gift-owner', expiresIn: 3600 }
  const { resetAllMocks } = await import('@/mock')
  resetAllMocks()
  const { cardApi } = await import('../../gift-card')
  const { cardExchangeApi } = await import('../../gift-card-exchange/api/exchange.api')
  const { cardSendApi } = await import('../../gift-card-send/api/send.api')
  const { cardLogsApi } = await import('../../gift-card-logs/api/logs.api')
  const { cardReceiveApi } = await import('../api/receive.api')
  const catalog = await cardApi.list()
  expect(catalog).toHaveLength(8)
  expect(catalog.every(item => item.pic?.startsWith('/src/mock/assets/images/home/gift-card/'))).toBe(true)
  const initial = await cardApi.my()
  expect(initial).toHaveLength(7)
  const { useCardLogsPage } = await import('../../gift-card-logs/composables/use-page')
  const logsScope = effectScope()
  try {
    const logs = logsScope.run(useCardLogsPage)!
    await logs.init({ cardId: String(initial[0].id) })
    expect(logs.card.value?.id).toBe(initial[0].id)
    expect(logs.list.value).toHaveLength(20)
    expect(logs.list.value[0].balance).toBe(initial[0].amount)
    expect(logs.hasMore.value).toBe(true)
    await logs.loadMore()
    expect(new Set(logs.list.value.map(row => row.id)).size).toBe(24)
    expect(logs.hasMore.value).toBe(false)
  }
  finally {
    logsScope.stop()
  }
  await expect(cardExchangeApi.exchange({ number: 'INVALID' })).rejects.toThrow()
  const { useCardExchangePage } = await import('../../gift-card-exchange/composables/use-page')
  const scope = effectScope()
  try {
    const exchange = scope.run(useCardExchangePage)!
    exchange.number.value = ' GIFT-DEMO '
    exchange.toggleAgree()
    await exchange.submit()
    expect(exchange.redeemed.value).toBe(true)
    expect(uni.redirectTo).toHaveBeenCalledWith(expect.objectContaining({ url: '/pages/home/service/gift-card/index?tab=my' }))
    await exchange.submit()
    expect(uni.redirectTo).toHaveBeenCalledTimes(1)
  }
  finally {
    scope.stop()
  }
  const card = (await cardApi.my())[0]
  expect(card.id).not.toBe(initial[0].id)
  await expect(cardExchangeApi.exchange({ number: 'GIFT-DEMO' })).rejects.toThrow()
  const token = await cardSendApi.openShare({ id: card.id, remark: '测试赠送' })
  const { parseSharePreview } = await import('../models/mappers')
  const preview = parseSharePreview(await cardReceiveApi.fetchShare({ id: card.id, shareToken: String(token), calculate: true }))
  expect(preview.cardUser?.id).toBe(card.id)
  expect(await cardApi.my()).toHaveLength(initial.length + 1)
  await expect(cardReceiveApi.fetchShare({ id: card.id, shareToken: String(token), calculate: false })).rejects.toThrow()
  await cardSendApi.shareClose({ id: card.id })
  await expect(cardReceiveApi.fetchShare({ id: card.id, shareToken: String(token), calculate: true })).rejects.toThrow()
  expect((await cardLogsApi.logs({ cardId: card.id }))!.result.map(row => row.eventType)).toEqual(['cancel', 'share', 'exchange'])
  const nextToken = await cardSendApi.openShare({ id: card.id, remark: '' })
  session.snapshot!.tokenInfo = { token: 'wx-demo-session-gift-recipient', expiresIn: 3600 }
  await expect(cardLogsApi.logs({ cardId: initial[0].id })).rejects.toThrow()
  expect((await cardApi.my()).some(item => item.id === card.id)).toBe(false)
  const recipientPreview = parseSharePreview(await cardReceiveApi.fetchShare({ id: card.id, shareToken: String(nextToken), calculate: true }))
  expect(recipientPreview.cardUser.id).toBe(card.id)
  expect((await cardApi.my()).some(item => item.id === card.id)).toBe(false)
  await cardReceiveApi.fetchShare({ id: card.id, shareToken: String(nextToken), calculate: false })
  expect((await cardApi.my()).map(item => item.id)).toContain(card.id)
  expect((await cardLogsApi.logs({ cardId: card.id }))!.result).toEqual([expect.objectContaining({ eventType: 'receive', direction: 'credit' })])
  await expect(cardReceiveApi.fetchShare({ id: card.id, shareToken: String(nextToken), calculate: false })).rejects.toThrow()
  await cardApi.demoAction('purchase', 1)
  const purchased = (await cardApi.my())[0]
  expect(purchased.amount).toBe(100)
  expect((await cardLogsApi.logs({ cardId: purchased.id }))!.result[0].eventType).toBe('purchase')
  await cardApi.demoAction('consume', purchased.id)
  expect((await cardApi.my())[0].amount).toBe(90)
  await cardApi.demoAction('refund', purchased.id)
  expect((await cardApi.my())[0].amount).toBe(100)
  const events = (await cardLogsApi.logs({ cardId: purchased.id }))!.result
  expect(events.map(row => row.eventType)).toEqual(['refund', 'consume', 'purchase'])
  expect(events[0].relatedLogId).toBe(events[1].id)
  await expect(cardApi.demoAction('refund', purchased.id)).rejects.toThrow()
  session.snapshot!.tokenInfo = { token: 'wx-demo-session-gift-owner', expiresIn: 3600 }
  await expect(cardApi.demoAction('consume', purchased.id)).rejects.toThrow()
  vi.stubEnv('VITE_USE_MOCK', 'false')
  await expect(cardApi.demoAction('purchase', 1)).rejects.toThrow('仅开发 Mock')
  expect(uni.request).not.toHaveBeenCalled()
  vi.stubEnv('VITE_USE_MOCK', 'true')
  resetAllMocks()
  const afterReset = await cardApi.my()
  expect(afterReset).toHaveLength(7)
  await cardExchangeApi.exchange({ number: 'GIFT-DEMO' })
  expect(await cardApi.my()).toHaveLength(8)
}, 30000)
