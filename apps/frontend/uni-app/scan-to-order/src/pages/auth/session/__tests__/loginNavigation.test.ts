import { afterEach, expect, it, vi } from 'vitest'
import { redirectToLogin } from '../loginNavigation'
import { toLoginPage } from '@/utils/toLoginPage'

const { getLastPage } = vi.hoisted(() => ({ getLastPage: vi.fn() }))
vi.mock('@/utils', () => ({ getLastPage }))

afterEach(() => {
  redirectToLogin.cancel()
  vi.useRealTimers()
})

it.each([
  ['pages/home/index/index', '/pages/auth/login/index'],
  ['pages-shop/orders/index', '/pages-shop/auth/login/index'],
  ['/pages-rider/tasks/index', '/pages-rider/auth/login/index'],
])('按来源 %s 选择登录身份并保存参数', (route, login) => {
  const fullPath = `/${route.replace(/^\//, '')}?id=1&name=中文`
  getLastPage.mockReturnValue({ route, $page: { fullPath } })
  redirectToLogin()
  redirectToLogin.flush()
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: `${login}?redirect=${encodeURIComponent(fullPath)}` })
})

it('显式身份、查询串及 reLaunch 优先于来源默认值', () => {
  getLastPage.mockReturnValue({ route: 'pages/home/index/index' })
  redirectToLogin({ identity: 'rider', mode: 'reLaunch', queryString: '?redirect=%2Ftarget' })
  redirectToLogin.flush()
  expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages-rider/auth/login/index?redirect=%2Ftarget' })
})

it.each(['customer', 'shop', 'rider'] as const)('已在 %s 登录页时不重复跳转', (identity) => {
  const route = identity === 'customer' ? 'pages/auth/login/index' : `pages-${identity}/auth/login/index`
  getLastPage.mockReturnValue({ route })
  redirectToLogin({ identity })
  redirectToLogin.flush()
  expect(uni.navigateTo).not.toHaveBeenCalled()
  expect(uni.reLaunch).not.toHaveBeenCalled()
})

it('没有当前页面时仍能引导默认登录', () => {
  getLastPage.mockReturnValue(undefined)
  redirectToLogin()
  redirectToLogin.flush()
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/auth/login/index' })
})

it('兼容入口与业务入口共享防抖、取消和立即执行', () => {
  vi.useFakeTimers()
  getLastPage.mockReturnValue({ route: 'pages/home/index/index' })
  expect(toLoginPage).toBe(redirectToLogin)
  toLoginPage({ identity: 'shop' })
  redirectToLogin({ identity: 'rider' })
  vi.advanceTimersByTime(499)
  expect(uni.navigateTo).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(uni.navigateTo).toHaveBeenCalledTimes(1)
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages-rider/auth/login/index?redirect=%2Fpages%2Fhome%2Findex%2Findex' })
  toLoginPage()
  redirectToLogin.cancel()
  vi.advanceTimersByTime(500)
  expect(uni.navigateTo).toHaveBeenCalledTimes(1)
})
