import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { clearSession, getIdentity, getToken, redirectToLogin } from '@/pages/auth/session'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { addressApi } from '../composables/use-requests'

// 保留真实会话、身份检查、登录跳转和页面，仅替换请求及平台边界。
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('../composables/use-requests', () => ({ addressApi: { list: vi.fn(async () => []), add: vi.fn(), update: vi.fn() } }))
vi.mock('@/pages/auth/session/api/session', () => ({ sessionApi: {} }))
vi.mock('@/utils', () => ({ getLastPage: () => getCurrentPages().at(-1) }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@/utils/project/interaction', () => ({ setTitle: vi.fn(), toast: vi.fn(), alert: vi.fn(), confirm: vi.fn(), showError: vi.fn(), withLoading: (action: () => Promise<unknown>) => action() }))

let show: () => Promise<void>
let wrapper: ReturnType<typeof mount> | undefined

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onShow', (callback: () => Promise<void>) => {
    show = callback
  })
  vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/account/profile/address/index' }])
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  redirectToLogin.cancel()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

async function openPage() {
  const Page = (await import('../index.vue')).default
  wrapper = mount(Page, { global: { stubs: { 'wd-navbar': true, 'wd-icon': true, 'wd-popup': true } } })
  await show()
  await flushPromises()
  return wrapper
}

it('真实未登录会话显示新增入口，点击跳顾客登录且不出现填写表单', async () => {
  const page = await openPage()
  expect(page.find('.empty-btn').exists()).toBe(true)
  expect(addressApi.list).not.toHaveBeenCalled()
  expect(uni.navigateTo).not.toHaveBeenCalled()
  await page.find('.empty-btn').trigger('tap')
  await vi.advanceTimersByTimeAsync(500)
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/auth/login/index?redirect=%2Fpages%2Faccount%2Fprofile%2Faddress%2Findex' })
  expect(page.find('input').exists()).toBe(false)
  expect(addressApi.add).not.toHaveBeenCalled()
})

it('取消登录返回仍有新增入口，完成顾客登录后点击才出现表单', async () => {
  const page = await openPage()
  expect(getToken()).toBe('')
  expect(getIdentity()).toBeNull()
  await page.find('.empty-btn').trigger('tap')
  await vi.advanceTimersByTimeAsync(500)
  await show()
  await flushPromises()
  expect(page.find('.empty-btn').exists()).toBe(true)
  expect(page.find('input').exists()).toBe(false)
  seedSession()
  await show()
  await flushPromises()
  expect(addressApi.list).toHaveBeenCalledOnce()
  await page.find('.empty-btn').trigger('tap')
  expect(page.find('input').exists()).toBe(true)
  clearSession()
  await flushPromises()
  expect(page.find('input').exists()).toBe(false)
})

it('凭证已过期的顾客点击新增同样引导登录', async () => {
  const state = seedSession()
  state.snapshot!.expiresAt = Date.now() - 1
  const page = await openPage()
  expect(getToken()).toBe('')
  expect(getIdentity()).toBe('customer')
  await page.find('.empty-btn').trigger('tap')
  await vi.advanceTimersByTimeAsync(500)
  expect(uni.navigateTo).toHaveBeenCalledOnce()
  expect(page.find('input').exists()).toBe(false)
  expect(addressApi.list).not.toHaveBeenCalled()
})

it('其他身份不能新增顾客地址', async () => {
  seedSession({}, 'shop')
  const page = await openPage()
  await page.find('.empty-btn').trigger('tap')
  expect(uni.showToast).toHaveBeenCalledWith({ title: '请先退出当前身份', icon: 'none' })
  expect(page.find('input').exists()).toBe(false)
  expect(addressApi.list).not.toHaveBeenCalled()
})
