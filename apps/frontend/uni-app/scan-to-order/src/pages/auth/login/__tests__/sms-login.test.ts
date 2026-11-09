import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useLoginFlow } from '../composables/use-flow'

const mocks = vi.hoisted(() => ({ send: vi.fn(), exchange: vi.fn(), returned: vi.fn().mockResolvedValue(undefined) }))
vi.mock('../api/login.api', () => ({ loginApi: { sendSms: mocks.send, exchangeSms: mocks.exchange } }))
vi.mock('../composables/use-wechat-environment', () => ({ getWechatEnvironment: () => ({ channel: 'web', mobileBrowser: true }) }))
vi.mock('../composables/use-return', () => ({ returnAfterLogin: mocks.returned }))
vi.mock('../../agreement', async importOriginal => ({ ...await importOriginal<typeof import('../../agreement')>(), AGREEMENT_VERSION: 'test-version', ensurePrivacyConsent: async () => true }))
vi.mock('@/mock/config', () => ({ USE_MOCK: false }))
vi.mock('@/pages/auth/session', () => ({
  useSessionState: () => ({
    updateNowTime: () => ({ hasLogin: false }),
    authenticate: async (_identity: string, exchange: () => Promise<unknown>) => exchange(),
  }),
}))

it('requires agreement and uses the shared customer session for SMS login', async () => {
  const scope = effectScope()
  try {
    const login = scope.run(useLoginFlow)!
    const phone = '+84912345678'
    await login.sendSms(phone)
    expect(mocks.send).not.toHaveBeenCalled()
    login.agreed.value = true
    login.pause()
    await login.sendSms(phone)
    await login.sendSms(phone)
    expect(mocks.send).toHaveBeenCalledExactlyOnceWith(phone)
    await login.signInWithSms(phone, '123456')
    expect(mocks.exchange).toHaveBeenCalledExactlyOnceWith(phone, '123456', 'test-version')
    expect(mocks.returned).not.toHaveBeenCalled()
    login.resume()
    expect(mocks.returned).toHaveBeenCalledOnce()
  }
  finally {
    scope.stop()
  }
})
