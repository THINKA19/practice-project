import { afterEach, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ token: '' }))
vi.mock('@/pages/auth/session', () => ({
  getToken: () => auth.token,
  getAuthorizationHeaders: () => ({ Authorization: `Bearer ${auth.token}` }),
}))
afterEach(() => vi.unstubAllEnvs())
it('团购分页、参团幂等、满员与过期限制通过实际请求链生效', async () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { resetAllMocks } = await import('@/mock')
  resetAllMocks()
  const { sessionState } = await import('@/pages/auth/session/mock')
  const { groupBuyingApi } = await import('../index')
  const issue = (id: number) => {
    const session = sessionState.issue('customer', false, id)
    auth.token = 'token' in session ? session.token : session.accessToken
  }
  expect((await groupBuyingApi.list(1, 10)).list).toHaveLength(10)
  expect((await groupBuyingApi.list(2, 10)).list).toHaveLength(8)
  issue(71)
  expect((await groupBuyingApi.join(1)).joined).toBe(2)
  expect((await groupBuyingApi.join(1)).joined).toBe(2)
  issue(72)
  expect((await groupBuyingApi.detail(1)).participating).toBe(false)
  expect((await groupBuyingApi.join(1)).joined).toBe(3)
  issue(73)
  await expect(groupBuyingApi.join(1)).rejects.toThrow()
  await expect(groupBuyingApi.join(18)).rejects.toThrow()
})
