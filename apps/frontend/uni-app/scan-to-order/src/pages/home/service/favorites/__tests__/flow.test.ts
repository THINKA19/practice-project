import { afterEach, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ token: '' }))
vi.mock('@/pages/auth/session', () => ({
  getToken: () => auth.token,
  getAuthorizationHeaders: () => ({ Authorization: `Bearer ${auth.token}` }),
}))
afterEach(() => vi.unstubAllEnvs())
it('收藏分页、取消收藏和账户隔离通过实际请求链完成', async () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { resetAllMocks } = await import('@/mock')
  resetAllMocks()
  const { sessionState } = await import('@/pages/auth/session/mock')
  const { favoritesApi } = await import('../api/favorites.api')
  const issue = (id: number) => {
    const session = sessionState.issue('customer', false, id)
    auth.token = 'token' in session ? session.token : session.accessToken
  }
  issue(71)
  expect((await favoritesApi.list(1, 10)).total).toBe(23)
  expect((await favoritesApi.list(3, 10)).list).toHaveLength(3)
  await favoritesApi.remove(1)
  expect((await favoritesApi.list(1, 10)).total).toBe(22)
  await favoritesApi.remove(1)
  expect((await favoritesApi.list(1, 10)).total).toBe(22)
  issue(72)
  expect((await favoritesApi.list(1, 10)).total).toBe(23)
})
