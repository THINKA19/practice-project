import { effectScope } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useRiderLoginPage } from '../composables/use-page'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: false, identity: null as string | null, authenticating: false, authenticate: vi.fn() },
  exchange: vi.fn(),
}))

vi.mock('@dcloudio/uni-app', () => ({ onLoad: vi.fn(), onShow: vi.fn() }))
vi.mock('@/utils', () => ({ getAllPages: () => [] }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => mocks.session, AUTH_ROUTES: { rider: '/pages-rider/auth/login/index' } }))
vi.mock('../api/login.api', () => ({
  riderWechatLoginAvailable: true,
  loginWithWechatPhone: mocks.exchange,
}))
vi.mock('../composables/use-actions', () => ({ isDemo: false, serviceReady: true, login: vi.fn() }))

const login = vi.fn()
let scope: ReturnType<typeof effectScope>

beforeEach(() => {
  scope = effectScope()
  mocks.session.hasLogin = false
  mocks.session.identity = null
  mocks.session.authenticate.mockReset()
  mocks.exchange.mockReset()
  login.mockReset()
  vi.stubGlobal('uni', { ...uni, login, redirectTo: vi.fn() })
})

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
})

it('将两种微信 code 分别提交，通过共享骑手会话后回跳', async () => {
  const page = scope.run(useRiderLoginPage)!
  login.mockImplementation(({ success }) => success({ code: 'login-code' }))
  mocks.session.authenticate.mockImplementation(async (_identity, exchange) => {
    await exchange()
    mocks.session.hasLogin = true
    mocks.session.identity = 'rider'
  })

  await page.authorizeWechatPhone({ detail: { code: 'phone-code' } })

  expect(login).toHaveBeenCalledWith(expect.objectContaining({ provider: 'weixin' }))
  expect(mocks.session.authenticate).toHaveBeenCalledWith('rider', expect.any(Function))
  expect(mocks.exchange).toHaveBeenCalledExactlyOnceWith({ loginCode: 'login-code', phoneCode: 'phone-code' })
  expect(uni.redirectTo).toHaveBeenCalledWith({ url: '/pages-rider/workspace/index/index' })
})

it('拒绝手机号授权时提供账密引导，已有其他身份时不尝试切换', async () => {
  const page = scope.run(useRiderLoginPage)!

  await page.authorizeWechatPhone({ detail: {} })
  expect(page.error.value).toContain('使用账号密码登录')

  mocks.session.hasLogin = true
  mocks.session.identity = 'customer'
  await page.authorizeWechatPhone({ detail: { code: 'phone-code' } })

  expect(login).not.toHaveBeenCalled()
  expect(mocks.session.authenticate).not.toHaveBeenCalled()
})

it('页面销毁后丢弃迟到的微信登录 code', async () => {
  const page = scope.run(useRiderLoginPage)!
  mocks.session.authenticate.mockImplementation((_identity, exchange) => exchange())

  const pending = page.authorizeWechatPhone({ detail: { code: 'phone-code' } })
  scope.stop()
  login.mock.calls[0][0].success({ code: 'late-code' })
  await pending

  expect(mocks.exchange).not.toHaveBeenCalled()
  expect(uni.redirectTo).not.toHaveBeenCalled()
})
