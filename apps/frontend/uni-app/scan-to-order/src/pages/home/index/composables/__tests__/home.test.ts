/**
 * ============================================================================
 * 【文件概述】首页接入回归测试：入口归属、游客刷新及失效分享身份。
 * 【方法与导出清单】无生产导出，使用 Vitest 执行。
 * 【综合使用示例】
 * import { useHomeNavigation } from '../use-navigation'
 * // pnpm exec vitest run src/pages/home/index/composables/__tests__/home.test.ts
 * // useHomeNavigation().openCoupons() 应进入 Home/user 下的优惠券测试页。
 * ============================================================================
 */
import { reactive } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHomeNavigation } from '../use-navigation'
import { useHomeShare } from '../use-share'
import { useHomeUser } from '../use-user'

const state = vi.hoisted(() => ({
  token: { identity: 'customer', hasLogin: false, updateNowTime: vi.fn() },
  user: { userInfo: { userId: -1, nickname: '', username: '', avatar: '' }, fetchUserInfo: vi.fn() },
}))

vi.mock('@/pages/auth/session', async () => ({
  ...await import('@/pages/auth/session/routes'),
  useSessionState: () => reactive({
    ...state.user,
    get hasLogin() {
      return reactive(state.token).hasLogin
    },
    get identity() {
      return reactive(state.token).identity
    },
    updateNowTime: state.token.updateNowTime,
  }),
}))
vi.mock('@/tabbar/store', () => ({ isPageTabbar: () => false }))
vi.mock('@/locale', () => ({ t: (key: string) => key }))

beforeEach(() => {
  state.token.identity = 'customer'
  state.token.hasLogin = false
  state.token.updateNowTime.mockReturnValue(state.token)
  state.user.userInfo.userId = -1
  state.user.fetchUserInfo.mockResolvedValue(undefined)
})

describe('首页接入', () => {
  it.each([
    ['openMemberCenter', '/pages/account/users/member-center/index'],
    ['openCoupons', '/pages/home/user/coupons/index'],
    ['openFavorites', '/pages/home/service/favorites/index'],
    ['openMemberCard', '/pages/home/service/gift-card/index'],
    ['openGroupBuying', '/pages/home/service/group-buying/index'],
    ['openWelfare', '/pages/home/service/welfare/index'],
  ] as const)('%s 进入当前配置的业务入口', (action, url) => {
    useHomeNavigation()[action]()
    expect(uni.navigateTo).toHaveBeenCalledWith(expect.objectContaining({ url }))
    expect(uni.request).not.toHaveBeenCalled()
  })

  it('选店进入点餐模块测试页，区分自取和配送且不写入门店状态', () => {
    const home = useHomeNavigation()
    home.openShopSelection('zq')
    home.openShopSelection('kd')
    expect(uni.navigateTo).toHaveBeenNthCalledWith(1, expect.objectContaining({ url: '/pages/ordering/shop/select?peisongType=zq' }))
    expect(uni.navigateTo).toHaveBeenNthCalledWith(2, expect.objectContaining({ url: '/pages/ordering/shop/select?peisongType=kd' }))
    expect(uni.setStorageSync).not.toHaveBeenCalled()
  })

  it('游客不刷新资料，已登录用户复用 Store，失败不产生未处理拒绝', async () => {
    const home = useHomeUser()
    await home.refresh()
    expect(state.user.fetchUserInfo).not.toHaveBeenCalled()
    reactive(state.token).hasLogin = true
    state.user.fetchUserInfo.mockRejectedValue(new Error('offline'))
    await expect(home.refresh()).resolves.toBeUndefined()
    expect(state.user.fetchUserInfo).toHaveBeenCalledOnce()
  })

  it('失效登录不分享缓存身份，有效用户携带邀请参数', () => {
    state.user.userInfo.userId = 12
    const home = useHomeShare()
    expect(home.shareAppMessage().path).toBe('/pages/home/index/index')
    expect(home.shareTimeline().query).toBe('')
    reactive(state.token).hasLogin = true
    expect(home.shareAppMessage().path).toBe('/pages/home/index/index?inviter_id=12')
  })

  it.each(['shop', 'rider'])('首页分享不携带 %s 身份的账号编号', (identity) => {
    state.user.userInfo.userId = 12
    reactive(state.token).hasLogin = true
    reactive(state.token).identity = identity
    const home = useHomeShare()
    expect(home.shareTimeline().query).toBe('')
    expect(home.shareAppMessage().path).toBe('/pages/home/index/index')
  })

  it('退出或切换其他身份后不展示缓存顾客资料', () => {
    reactive(state.token).hasLogin = true
    const home = useHomeUser()
    expect(home.hasLogin.value).toBe(true)
    reactive(state.token).identity = 'shop'
    expect(home.user.value).toBeNull()
    expect(home.hasLogin.value).toBe(false)
    expect(home.avatar.value).toBe('/static/images/default-avatar.png')
    reactive(state.token).identity = 'customer'
    expect(home.hasLogin.value).toBe(true)
    reactive(state.token).hasLogin = false
    expect(home.user.value).toBeNull()
  })
})

it('首页负责导航失败文案，公共导航保留原始失败', async () => {
  const pending = useHomeNavigation().openCoupons()
  const error = { errMsg: 'navigateTo:fail' }
  vi.mocked(uni.navigateTo).mock.calls.at(-1)![0].fail?.(error)
  await expect(pending).resolves.toEqual({ ok: false, error })
  expect(uni.showToast).toHaveBeenCalledWith({ title: 'common.navigationFailed', icon: 'none' })
})
