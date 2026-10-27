import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'
import { AGREEMENT_VERSION } from '../../../agreement'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))

afterEach(() => {
  vi.unstubAllEnvs()

  vi.mocked(uni.getStorageSync).mockReset().mockReturnValue(null)
})

it('confirms WeChat before exchanging credentials and commits the existing customer session', async () => {
  vi.resetModules()

  vi.stubEnv('DEV', true)

  vi.stubEnv('VITE_USE_MOCK', 'true')

  const storage = new Map<string, unknown>()

  vi.mocked(uni.setStorageSync).mockImplementation((key, value) => {
    storage.set(key, value)
  })

  vi.mocked(uni.getStorageSync).mockImplementation(key => storage.get(key))

  const { loginApi } = await import('../../api/login.api')

  const { useSessionState } = await import('@/pages/auth/session')

  const ticket = await loginApi.start('web', AGREEMENT_VERSION)

  const payload = { ticket: ticket.id, pollToken: ticket.pollToken, channel: 'web' as const, agreementVersion: AGREEMENT_VERSION }

  expect((await loginApi.status(ticket)).status).toBe('pending')

  await expect(loginApi.exchange(payload)).rejects.toThrow()

  await loginApi.confirmDemo(ticket)

  const session = useSessionState()

  await session.authenticate('customer', () => loginApi.exchange(payload))

  expect(session.hasLogin).toBe(true)

  expect(session.identity).toBe('customer')

  expect(useSessionState().userInfo.userId).toBe(10001)

  expect(useSessionState().userInfo.nickname).toBe('微信顾客')

  await expect(loginApi.exchange(payload)).rejects.toThrow()

  expect(uni.request).not.toHaveBeenCalled()
})

it('never enables simulated confirmation in production', async () => {
  vi.resetModules()

  vi.stubEnv('DEV', false)

  vi.stubEnv('VITE_USE_MOCK', 'true')

  const { loginApi } = await import('../../api/login.api')

  await expect(loginApi.confirmDemo({ id: 'x', pollToken: 'p', expiresAt: Date.now() + 1000 })).rejects.toThrow('仅开发环境')

  expect(uni.request).not.toHaveBeenCalled()
})

beforeEach(() => resetAllMocks())
