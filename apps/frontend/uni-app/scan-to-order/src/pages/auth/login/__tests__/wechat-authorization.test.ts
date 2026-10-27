import { beforeEach, expect, it, vi } from 'vitest'
import { useLoginWechatAuthorization } from '../composables/use-wechat-authorization'
import { enablePrivacyConsent, finishPrivacyConsent } from '../../agreement/composables/use-privacy-consent'

const mocks = vi.hoisted(() => ({ exchange: vi.fn(), wxCode: vi.fn(), authenticate: vi.fn() }))
vi.mock('../api/login.api', () => ({ loginApi: { demo: false, exchange: mocks.exchange } }))
vi.mock('../composables/use-wechat-credential', () => ({ getWxCode: mocks.wxCode }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => ({ hasLogin: false, authenticate: mocks.authenticate }) }))
beforeEach(() => {
  vi.clearAllMocks()
  mocks.wxCode.mockResolvedValue({ code: 'login-code' })
  mocks.authenticate.mockImplementation((_identity, exchange) => exchange())
})
it('无需手机号即可登录，同一时刻只交换一次凭证', async () => {
  const auth = useLoginWechatAuthorization()
  const pending = auth.authorize()
  expect(await auth.authorize()).toBe(false)
  expect(await pending).toBe(true)
  expect(mocks.exchange).toHaveBeenCalledWith(expect.objectContaining({ code: 'login-code', channel: 'mini' }))
  expect(mocks.exchange.mock.calls[0][0]).not.toHaveProperty('phoneCode')
  expect(mocks.authenticate).toHaveBeenCalledOnce()
})
it('微信凭证失败不提交会话并允许重试', async () => {
  mocks.wxCode.mockResolvedValueOnce({ code: '' })
  const auth = useLoginWechatAuthorization()
  expect(await auth.authorize()).toBe(false)
  expect(mocks.authenticate).not.toHaveBeenCalled()
  expect(await auth.authorize()).toBe(true)
})

it('先拒绝隐私政策不申请微信凭证，主动重试接受后才兑换', async () => {
  enablePrivacyConsent()
  const auth = useLoginWechatAuthorization()
  const rejected = auth.authorize()
  finishPrivacyConsent(false)
  expect(await rejected).toBe(false)
  expect(mocks.wxCode).not.toHaveBeenCalled()
  expect(mocks.exchange).not.toHaveBeenCalled()
  const accepted = auth.authorize()
  finishPrivacyConsent(true)
  expect(await accepted).toBe(true)
  expect(mocks.wxCode).toHaveBeenCalledOnce()
  expect(mocks.exchange).toHaveBeenCalledOnce()
})
