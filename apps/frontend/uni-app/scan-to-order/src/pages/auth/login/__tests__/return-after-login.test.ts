import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { returnAfterLogin } from '../composables/use-return'

const mocks = vi.hoisted(() => ({ isTab: false }))
vi.mock('@/tabbar/store', () => ({ isPageTabbar: () => mocks.isTab }))
vi.mock('@/tabbar/config', () => ({ tabbarCacheEnable: true }))

const target = '/pages/account/users/user-code/index'
const login = { route: 'pages/auth/login/index' }
let back: ReturnType<typeof vi.fn>
let redirect: ReturnType<typeof vi.fn>
let switchTab: ReturnType<typeof vi.fn>

beforeEach(() => {
  mocks.isTab = false
  back = vi.fn(options => options.success())
  redirect = vi.fn(options => options.success())
  switchTab = vi.fn(options => options.success())
  vi.stubGlobal('uni', { navigateBack: back, redirectTo: redirect, switchTab })
})
afterEach(() => vi.unstubAllGlobals())

it('从会员码进入登录后返回已有页面，不重建会员码或清空历史', async () => {
  vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/account/index/index' }, { route: target.slice(1) }, login])
  await returnAfterLogin(target)
  expect(back).toHaveBeenCalledWith(expect.objectContaining({ delta: 1 }))
  expect(redirect).not.toHaveBeenCalled()
  expect(switchTab).not.toHaveBeenCalled()
})

it('原目标位于更早页面时返回正确层数', async () => {
  vi.stubGlobal('getCurrentPages', () => [{ route: target.slice(1) }, { route: 'pages/auth/register/index' }, login])
  await returnAfterLogin(target)
  expect(back).toHaveBeenCalledWith(expect.objectContaining({ delta: 2 }))
})

it('保留目标查询参数，不返回同路径下参数不同的页面', async () => {
  vi.stubGlobal('getCurrentPages', () => [{ route: target.slice(1), $page: { fullPath: `${target}?id=one` } }, login])
  await returnAfterLogin(`${target}?id=two`)
  expect(back).not.toHaveBeenCalled()
  expect(redirect).toHaveBeenCalledWith(expect.objectContaining({ url: `${target}?id=two` }))
})

it('小程序页面用 route 和 options 匹配原目标', async () => {
  vi.stubGlobal('getCurrentPages', () => [{ route: target.slice(1), options: { id: 'one' } }, login])
  await returnAfterLogin(`${target}?id=one`)
  expect(back).toHaveBeenCalledWith(expect.objectContaining({ delta: 1 }))
})

it('直接进入登录页时替换当前页，不调用 reLaunch 或伪造上一页', async () => {
  vi.stubGlobal('getCurrentPages', () => [login])
  await returnAfterLogin(target)
  expect(back).not.toHaveBeenCalled()
  expect(redirect).toHaveBeenCalledWith(expect.objectContaining({ url: target }))
})

it('目标是原生 Tab 页且不在历史中时使用 switchTab', async () => {
  mocks.isTab = true
  vi.stubGlobal('getCurrentPages', () => [login])
  await returnAfterLogin('/pages/home/index/index')
  expect(switchTab).toHaveBeenCalledWith(expect.objectContaining({ url: '/pages/home/index/index' }))
  expect(redirect).not.toHaveBeenCalled()
})

it('返回失败时只替换登录页，目标导航失败向调用方报错', async () => {
  vi.stubGlobal('getCurrentPages', () => [{ route: target.slice(1) }, login])
  back.mockImplementation(options => options.fail())
  await returnAfterLogin(target)
  expect(redirect).toHaveBeenCalledOnce()
  const error = new Error('navigation failed')
  redirect.mockImplementation(options => options.fail(error))
  await expect(returnAfterLogin(target)).rejects.toBe(error)
})
