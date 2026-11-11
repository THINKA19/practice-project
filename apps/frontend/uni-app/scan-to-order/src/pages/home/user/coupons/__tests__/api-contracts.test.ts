import { afterEach, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ token: '', identity: null as string | null }))
vi.mock('@/pages/auth/session', () => ({ getToken: () => auth.token, getIdentity: () => auth.identity }))
afterEach(() => vi.unstubAllEnvs())
it('首页优惠券分页、口令领取、兑换与账户隔离通过实际请求链完成', async () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { resetAllMocks } = await import('@/mock')
  resetAllMocks()
  const { sessionState } = await import('@/pages/auth/session/mock')
  const { couponApi } = await import('../composables/use-requests')
  const page = await couponApi.templates({ page: 1, pageSize: 20 })
  expect(page.list).toHaveLength(20)
  expect(page.total).toBe(56)
  const issued = sessionState.issue('customer', false, 71)
  auth.token = 'token' in issued ? issued.token : issued.accessToken
  auth.identity = 'customer'
  await couponApi.fetch({ id: 1 })
  await expect(couponApi.fetch({ id: 1 })).rejects.toThrow()
  await expect(couponApi.fetch({ id: 2, pwd: 'wrong' })).rejects.toThrow()
  await couponApi.fetch({ id: 2, pwd: 'DEMO' })
  await couponApi.exchange('DEMO2026', 'DEMO')
  await expect(couponApi.exchange('DEMO2026', 'DEMO')).rejects.toThrow()
  expect((await couponApi.my({ page: 1, pageSize: 20, status: 0 })).list).toHaveLength(6)
  const other = sessionState.issue('customer', false, 72)
  auth.token = 'token' in other ? other.token : other.accessToken
  expect((await couponApi.my({ page: 1, pageSize: 20, status: 0 })).list).toHaveLength(3)
}, 20000)
