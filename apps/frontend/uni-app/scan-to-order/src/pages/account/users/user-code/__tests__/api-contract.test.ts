import { afterEach, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ token: '', identity: 'customer' as string | null }))
vi.mock('@/pages/auth/session', () => ({ getToken: () => auth.token, getIdentity: () => auth.identity }))
vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(uni.request).mockReset()
})

it('通过真实 Alova 发现模块 Mock，动态码禁用缓存；生产和其他身份不发请求', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { sessionState } = await import('@/pages/auth/session/mock')
  const issued = sessionState.issue('customer')
  auth.token = 'token' in issued ? issued.token : issued.accessToken
  const { memberCodeApi } = await import('../composables/use-requests')
  const first = await memberCodeApi.dynamic()
  const second = await memberCodeApi.dynamic()
  expect(first.demo).toBe(true)
  expect(second.code).not.toBe(first.code)
  expect(first.expiresAt).toBeGreaterThan(Date.now())
  expect(uni.request).not.toHaveBeenCalled()
  auth.identity = 'shop'
  await expect(memberCodeApi.dynamic()).rejects.toThrow('请先登录')
  auth.identity = null
  auth.token = ''
  await expect(memberCodeApi.dynamic()).rejects.toThrow('请先登录')
  vi.stubEnv('DEV', false)
  await expect(memberCodeApi.dynamic()).rejects.toThrow('暂未接入')
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)
