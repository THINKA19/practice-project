import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, reactive } from 'vue'
import { useAccountPage } from '../composables/use-page'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: false, identity: null as string | null, userInfo: { userId: 7, nickname: '客户', username: 'test', avatar: '' }, updateNowTime: vi.fn() },
  navigate: vi.fn().mockResolvedValue({ ok: true }),
  assets: { available: false, summary: vi.fn() },
}))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), AUTH_ROUTES: { customer: '/pages/auth/login/index', shop: '/pages-shop/auth/login/index', rider: '/pages-rider/auth/login/index' } }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))
vi.mock('../composables/use-assets-requests', () => ({ assetsApi: mocks.assets }))
vi.mock('@/utils/project/feedback', () => ({ toast: vi.fn() }))

beforeEach(() => {
  mocks.session.hasLogin = false
  mocks.session.identity = null
  mocks.navigate.mockClear()
  mocks.assets.available = false
  mocks.assets.summary.mockReset()
})
afterEach(() => vi.unstubAllEnvs())

describe('个人中心接入', () => {
  it('游客不请求账户资产，客户登录后加载资产，退出后立即清空', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_USE_MOCK', 'true')
    mocks.assets.available = true
    mocks.assets.summary.mockResolvedValue({ couponCount: 3, balanceCents: 12850, points: 260, demo: true })
    const scope = effectScope()
    try {
      const vm = scope.run(() => useAccountPage())!
      await vm.refresh()
      expect(vm.balance.value).toBeNull()
      expect(mocks.assets.summary).not.toHaveBeenCalled()
      const state = reactive(mocks.session)
      state.hasLogin = true
      state.identity = 'customer'
      await vm.refresh()
      expect(vm.balance.value).toBe('128.50')
      expect(vm.score.value).toBe(260)
      expect(mocks.assets.summary).toHaveBeenCalledOnce()
      state.hasLogin = false
      expect(vm.balance.value).toBeNull()
      expect(vm.score.value).toBeNull()
      await vm.refresh()
      expect(mocks.assets.summary).toHaveBeenCalledOnce()
    }
    finally { scope.stop() }
  })
  it('游客点击昵称进入正式登录页，功能入口进入对应业务页', async () => {
    const vm = useAccountPage()
    expect(vm.user.value).toBeNull()
    await vm.editNick()
    expect(mocks.navigate).toHaveBeenCalledWith('/pages/auth/login/index')
    await vm.goBalance()
    expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/assets/asset/index')
    expect(vm.balance.value).toBeNull()
    await vm.goUserCode()
    expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/users/user-code/index', { title: '会员码' })
    await vm.navTo('意见反馈')
    expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/profile/feedback/index', { title: '意见反馈' })
  })

  it('仅展示客户身份资料，身份变化后清除展示', () => {
    mocks.session.hasLogin = true
    mocks.session.identity = 'customer'
    const vm = useAccountPage()
    expect(vm.nick.value).toBe('客户')
    const state = reactive(mocks.session)
    state.identity = 'shop'
    expect(vm.user.value).toBeNull()
    expect(vm.avatar.value).toBe('/static/images/default-avatar.png')
  })
})
