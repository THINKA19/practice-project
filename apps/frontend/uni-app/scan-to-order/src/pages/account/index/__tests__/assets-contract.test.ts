import { afterEach, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ token: '', identity: 'customer' as string | null }))
vi.mock('@/pages/auth/session', () => ({ getToken: () => auth.token, getIdentity: () => auth.identity }))
vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(uni.request).mockReset()
})

it('真实 Alova 链发现资产 Mock，按当前客户凭证返回数字且不访问网络', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { sessionState } = await import('@/pages/auth/session/mock')
  const issued = sessionState.issue('customer')
  auth.token = 'token' in issued ? issued.token : issued.accessToken
  const { assetsApi } = await import('../composables/use-assets-requests')
  expect(await assetsApi.summary()).toEqual({ couponCount: 3, balanceCents: 12850, points: 260, demo: true })
  expect(uni.request).not.toHaveBeenCalled()
  // 模拟刷新页面：本地凭证还在，Mock 内存会话已重置；每次仍通过请求获取样本。
  sessionState.reset()
  expect(await assetsApi.summary()).toEqual({ couponCount: 3, balanceCents: 12850, points: 260, demo: true })
  expect(uni.request).not.toHaveBeenCalled()
  // 游客通过独立公开演示接口获取数字，不创建或伪造客户会话。
  auth.token = ''
  auth.identity = null
  expect(await assetsApi.summary()).toEqual({ couponCount: 3, balanceCents: 12850, points: 260, demo: true })
  expect(uni.request).not.toHaveBeenCalled()
  auth.identity = 'shop'
  await expect(assetsApi.summary()).rejects.toThrow('请先登录')
  vi.stubEnv('DEV', false)
  await expect(assetsApi.summary()).rejects.toThrow('资产服务尚未接入')
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)
