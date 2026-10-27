import { afterEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useLoginFlow } from '../composables/use-flow'
import { enablePrivacyConsent, finishPrivacyConsent } from '../../agreement/composables/use-privacy-consent'

const mocks = vi.hoisted(() => ({ start: vi.fn(), wxCode: vi.fn() }))
vi.mock('../api/login.api', () => ({ loginApi: { start: mocks.start } }))
vi.mock('../../session/api/session', () => ({ sessionApi: {} }))
vi.mock('../composables/use-wechat-credential', () => ({ getWxCode: mocks.wxCode }))
vi.mock('../composables/use-wechat-environment', () => ({ getWechatEnvironment: () => ({ channel: 'mini', mobileBrowser: false }) }))
vi.mock('../composables/use-return', () => ({ returnAfterLogin: vi.fn() }))
vi.mock('../storage/oauth-pending.storage', () => ({ browserCallback: () => ({}), clearPending: vi.fn() }))
vi.mock('@/mock/config', () => ({ USE_MOCK: true }))
vi.mock('@/utils', () => ({ getAllPages: () => [] }))
vi.mock('@/locale', () => ({ t: (key: string) => key }))

afterEach(() => finishPrivacyConsent(false))

it('完整登录页拒绝隐私时不申请票据，重新接受后继续原登录流程', async () => {
  enablePrivacyConsent()
  mocks.start.mockResolvedValue({ id: 'ticket' })
  const scope = effectScope()
  const login = scope.run(() => useLoginFlow())!
  login.agreed.value = true
  const rejected = login.start()
  finishPrivacyConsent(false)
  await rejected
  expect(mocks.start).not.toHaveBeenCalled()
  expect(mocks.wxCode).not.toHaveBeenCalled()
  const accepted = login.start()
  finishPrivacyConsent(true)
  await accepted
  expect(mocks.start).toHaveBeenCalledOnce()
  expect(login.ticket.value?.id).toBe('ticket')
  scope.stop()
})

it('等待隐私选择期间页面被销毁，不继续发起登录', async () => {
  enablePrivacyConsent()
  const scope = effectScope()
  const login = scope.run(() => useLoginFlow())!
  login.agreed.value = true
  const task = login.start()
  scope.stop()
  finishPrivacyConsent(true)
  await task
  expect(mocks.start).not.toHaveBeenCalled()
})
