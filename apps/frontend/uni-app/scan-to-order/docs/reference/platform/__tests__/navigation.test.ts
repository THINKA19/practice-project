// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
import { ClientRoutes } from '@/pages/routes'
import { ShopRoutes } from '@/pages-shop/routes'
import { RiderRoutes } from '@/pages-rider/routes'
import { beforeEach, expect, it, vi } from 'vitest'
import { back, backOr, buildUrl, currentRoute, go, redirect, relaunch, switchTab } from '../navigation'

beforeEach(() => {
  vi.clearAllMocks()
  Object.assign(uni, {
    navigateTo: vi.fn(),
    switchTab: vi.fn(),
    redirectTo: vi.fn(),
    reLaunch: vi.fn(),
    navigateBack: vi.fn(),
  })
  vi.mocked(getCurrentPages).mockReturnValue([])
})

it('keeps role routes separate and encodes query keys and values', () => {
  expect(ShopRoutes.Access.login).toBe('/pages-shop/access/auth/login')
  expect(RiderRoutes.Access.login).toBe('/pages-rider/access/auth/login')
  expect(buildUrl('/detail?id=1', { 'a&b': '中 文', 'empty': null, 'zero': 0 }))
    .toBe('/detail?id=1&a%26b=%E4%B8%AD%20%E6%96%87&zero=0')
})

it('recognizes the service tab from the scaffold configuration', () => {
  go('pages/service/index/index', { id: 1 })
  expect(uni.switchTab).toHaveBeenCalledWith({ url: ClientRoutes.Service.index })
  expect(uni.navigateTo).not.toHaveBeenCalled()
  go(ShopRoutes.Access.login, { from: '首页' })
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: `${ShopRoutes.Access.login}?from=%E9%A6%96%E9%A1%B5` })
})

it('handles tab destinations in redirect, switch and relaunch', () => {
  redirect(ClientRoutes.Home.home, { ignored: true })
  switchTab(`${ClientRoutes.Home.home}?id=1`)
  expect(uni.switchTab).toHaveBeenLastCalledWith({ url: ClientRoutes.Home.home })
  expect(uni.redirectTo).not.toHaveBeenCalled()
  relaunch(ClientRoutes.Home.home, { ignored: true })
  expect(uni.reLaunch).toHaveBeenCalledWith({ url: ClientRoutes.Home.home })
})

it('falls back to a tab without attempting redirectTo when the stack is empty', () => {
  backOr(ClientRoutes.Home.home)
  expect(uni.switchTab).toHaveBeenCalledWith({ url: ClientRoutes.Home.home })
  expect(uni.navigateBack).not.toHaveBeenCalled()
  expect(currentRoute()).toBe('')
})

it('bounds back steps and handles a failed native back', () => {
  vi.mocked(getCurrentPages).mockReturnValue([
    { route: 'pages/home/index/index' },
    { route: 'pages/detail/index' },
  ] as ReturnType<typeof getCurrentPages>)
  expect(currentRoute()).toBe('/pages/detail/index')
  back(99)
  const options = vi.mocked(uni.navigateBack).mock.calls[0][0]!
  expect(options.delta).toBe(1)
  backOr(ClientRoutes.Home.home)
  vi.mocked(uni.navigateBack).mock.calls[1][0]!.fail!({ errMsg: 'failed' })
  expect(uni.switchTab).toHaveBeenCalledWith({ url: ClientRoutes.Home.home })
})
