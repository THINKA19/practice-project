import { expect, it, vi } from 'vitest'
import { useTokenStore } from '../token'
import { requestInterceptor } from '@/http/interceptor'
import { sessionApi } from '@/pages/auth/session/api/session'
import { clearSession, getToken } from '@/pages/auth/session'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

vi.mock('@/pages/auth/session/api/session', () => ({ sessionApi: { profile: vi.fn(), refresh: vi.fn(), logout: vi.fn() } }))

it('旧请求拦截器读取唯一会话凭证', () => {
  const addInterceptor = vi.fn()
  vi.stubGlobal('uni', { ...uni, addInterceptor })
  try {
    requestInterceptor.install()
    const interceptor = addInterceptor.mock.calls.find(([name]) => name === 'request')![1]
    seedSession({}, 'shop')
    expect(interceptor.invoke({ url: 'https://example.com/orders' }).header.Authorization).toBe('Bearer old')
    clearSession()
    expect(interceptor.invoke({ url: 'https://example.com/orders' }).header.Authorization).toBeUndefined()
  }
  finally {
    vi.unstubAllGlobals()
  }
})

it('过期凭证通过唯一会话刷新，并同步给旧调用方', async () => {
  const state = seedSession({}, 'rider', true)
  state.snapshot!.expiresAt = Date.now() - 1
  vi.mocked(sessionApi.refresh).mockResolvedValue({ accessToken: 'new', refreshToken: 'new-refresh', accessExpiresIn: 3600, refreshExpiresIn: 7200 })
  const token = useTokenStore()
  expect(token.hasLogin).toBe(false)
  expect(await token.tryGetValidToken()).toBe('new')
  expect(getToken()).toBe('new')
  expect(sessionApi.refresh).toHaveBeenCalledWith('rider', 'refresh')
  expect(token.tokenInfo).toMatchObject({ accessToken: 'new' })
})

it('刷新失败返回空凭证，本地清理不发起注销请求', async () => {
  const state = seedSession({}, 'customer', true)
  state.snapshot!.expiresAt = Date.now() - 1
  vi.mocked(sessionApi.refresh).mockRejectedValue(new Error('刷新失败'))
  const token = useTokenStore()
  expect(await token.tryGetValidToken()).toBe('')
  token.logout()
  expect(token.tokenInfo).toBeNull()
  expect(sessionApi.logout).not.toHaveBeenCalled()
})
