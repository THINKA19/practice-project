import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useShopLoginPage } from '@/pages-shop/auth/login/composables/use-page'
import { useRiderLoginPage } from '@/pages-rider/auth/login/composables/use-page'

const mocks = vi.hoisted(() => ({
  load: [] as Array<(query: Record<string, string>) => void>,
  session: { hasLogin: true, identity: 'shop', sessionRevision: 1, authenticating: false, updateNowTime: vi.fn(), clearSession: vi.fn(), authenticate: vi.fn(), logout: vi.fn() },
}))
vi.mock('@dcloudio/uni-app', () => ({ onLoad: (callback: (query: Record<string, string>) => void) => mocks.load.push(callback), onShow: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => mocks.session, AUTH_ROUTES: { customer: '/pages/auth/login/index', shop: '/pages-shop/auth/login/index', rider: '/pages-rider/auth/login/index' } }))
vi.mock('@/utils', () => ({ getAllPages: () => [{ path: '/pages-shop/auth/onboarding/index' }, { path: '/pages-rider/workspace/index/index' }] }))
vi.mock('@/pages-shop/auth/login/composables/use-actions', () => ({ isDemo: true, serviceReady: true, login: vi.fn() }))
vi.mock('@/pages-rider/auth/login/composables/use-actions', () => ({ isDemo: true, serviceReady: true, login: vi.fn() }))
beforeEach(() => {
  mocks.load = []
  mocks.session.authenticate.mockReset()
})

it.each([
  ['shop', useShopLoginPage, '/pages-shop/auth/onboarding/index'],
  ['rider', useRiderLoginPage, '/pages-rider/workspace/index/index'],
] as const)('%s 登录页销毁后不执行迟到的回跳', async (identity, create, target) => {
  const scope = effectScope()
  const vm = scope.run(() => create())!
  mocks.session.identity = identity
  mocks.load[0]({ redirect: encodeURIComponent(target) })
  let finish!: () => void
  mocks.session.authenticate.mockReturnValueOnce(new Promise<void>((resolve) => {
    finish = resolve
  }))
  vm.password.value = 'secret'
  const pending = vm.submit()
  scope.stop()
  finish()
  await pending
  expect(vm.password.value).toBe('')
  expect(uni.redirectTo).not.toHaveBeenCalled()
})
