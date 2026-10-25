import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { usePage } from '../composables/usePage'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: false, identity: null as string | null, userInfo: { userId: 7, nickname: '客户', username: 'test', avatar: '' }, updateNowTime: vi.fn() },
  navigate: vi.fn().mockResolvedValue({ ok: true }),
}))
vi.mock('@/pages/auth/session', () => ({ useSession: () => reactive(mocks.session), AUTH_ROUTES: { customer: '/pages/auth/login/index', shop: '/pages-shop/auth/login/index', rider: '/pages-rider/auth/login/index' } }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))
vi.mock('../api/assets', () => ({ assetsApi: { available: false, summary: vi.fn() } }))
vi.mock('@/utils/project/feedback', () => ({ toast: vi.fn() }))

beforeEach(() => {
  mocks.session.hasLogin = false
  mocks.session.identity = null
  mocks.navigate.mockClear()
})

describe('个人中心接入', () => {
  it('游客点击昵称进入正式登录页，功能入口进入测试页', async () => {
    const vm = usePage()
    expect(vm.user.value).toBeNull()
    await vm.editNick()
    expect(mocks.navigate).toHaveBeenCalledWith('/pages/auth/login/index')
    await vm.goBalance()
    expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/test/index', { title: '余额' })
    expect(vm.balance.value).toBeNull()
    await vm.goUserCode()
    expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/code/index', { title: '会员码' })
    await vm.navTo('意见反馈')
    expect(mocks.navigate).toHaveBeenLastCalledWith('/pages/account/feedback/index', { title: '意见反馈' })
  })

  it('仅展示客户身份资料，身份变化后清除展示', () => {
    mocks.session.hasLogin = true
    mocks.session.identity = 'customer'
    const vm = usePage()
    expect(vm.uid.value).toBe(7)
    const state = reactive(mocks.session)
    state.identity = 'shop'
    expect(vm.user.value).toBeNull()
    expect(vm.uid.value).toBeUndefined()
    expect(vm.canHX).toBe(false)
  })
})
