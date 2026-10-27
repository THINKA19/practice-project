import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())
it('真实请求链发现迁移后的礼品卡 Mock，兑换、预览、领取及重复领取隔离', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { seedSession } = await import('@/pages/auth/session/__tests__/fixtures')
  const session = seedSession()
  session.snapshot!.tokenInfo = { token: 'wx-demo-session-gift-owner', expiresIn: 3600 }
  const { cardApi } = await import('../composables/use-requests')
  const catalog = await cardApi.list()
  expect(catalog).toHaveLength(4)
  expect(catalog.every(item => item.pic?.startsWith('/static/images/gift-card/'))).toBe(true)
  await cardApi.exchange({ number: 'GIFT-DEMO' })
  const card = (await cardApi.my())[0]
  expect(card).toBeDefined()
  await expect(cardApi.exchange({ number: 'GIFT-DEMO' })).rejects.toThrow()
  const token = await cardApi.openShare(card.id, '测试赠送')
  const preview = await cardApi.fetchShare(card.id, token, true)
  expect(preview.cardUser?.id).toBe(card.id)
  expect(await cardApi.my()).toHaveLength(1)
  await expect(cardApi.fetchShare(card.id, token, false)).rejects.toThrow()
  await cardApi.shareClose({ id: card.id })
  await expect(cardApi.fetchShare(card.id, token, true)).rejects.toThrow()
  const nextToken = await cardApi.openShare(card.id)
  session.snapshot!.tokenInfo = { token: 'wx-demo-session-gift-recipient', expiresIn: 3600 }
  expect(await cardApi.my()).toHaveLength(0)
  await cardApi.fetchShare(card.id, nextToken, false)
  expect(await cardApi.my()).toHaveLength(1)
  await expect(cardApi.fetchShare(card.id, nextToken, false)).rejects.toThrow()
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)
