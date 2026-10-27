/** 正式导航入口回归：参数、tabbar 分流、失败信息及反馈隔离。 */
import { beforeEach, expect, it, vi } from 'vitest'
import { navigate } from '../navigation'
import { toast } from '../feedback'

vi.mock('@/tabbar/config', () => ({ tabbarCacheEnable: true }))
vi.mock('@/tabbar/store', () => ({ isPageTabbar: (path: string) => path === '/pages/home/index/index' }))
beforeEach(() => {
  vi.mocked(uni.navigateTo).mockReset()
  vi.mocked(uni.switchTab).mockReset()
  vi.mocked(uni.reLaunch).mockReset()
})

it('encodes query values while preserving existing parameters and falsy values', async () => {
  const pending = navigate('pages/detail/index?from=home', { name: '中 & 文', zero: 0, enabled: false, empty: '', ignored: null })
  const options = vi.mocked(uni.navigateTo).mock.calls[0][0]
  expect(options.url).toBe('/pages/detail/index?from=home&name=%E4%B8%AD%20%26%20%E6%96%87&zero=0&enabled=false&empty=')
  options.success?.({ errMsg: 'ok', eventChannel: { emit: vi.fn(), on: vi.fn(), once: vi.fn(), off: vi.fn() } })
  await expect(pending).resolves.toEqual({ ok: true })
})

it('uses the existing tabbar decision and omits unsupported tab query parameters', async () => {
  const pending = navigate('/pages/home/index/index?from=share', { id: 1 })
  const options = vi.mocked(uni.switchTab).mock.calls[0][0]
  expect(options.url).toBe('/pages/home/index/index')
  expect(uni.navigateTo).not.toHaveBeenCalled()
  options.success?.({ errMsg: 'ok' })
  await expect(pending).resolves.toEqual({ ok: true })
})

it('returns platform failures without choosing a page or displaying a toast', async () => {
  const pending = navigate('/pages/detail/index')
  const error = { errMsg: 'navigateTo:fail page not found' }
  vi.mocked(uni.navigateTo).mock.calls[0][0].fail?.(error)
  await expect(pending).resolves.toEqual({ ok: false, error })
  expect(uni.showToast).not.toHaveBeenCalled()
})

it('returns synchronous adapter exceptions as a failure result', async () => {
  const error = new Error('adapter unavailable')
  vi.mocked(uni.navigateTo).mockImplementation(() => {
    throw error
  })
  await expect(navigate('/pages/detail/index')).resolves.toEqual({ ok: false, error })
})

it.each(['', 'https://example.com', '//example.com', 'javascript:alert(1)', '/pages/a#hash'])('rejects unsupported target %s', async (path) => {
  expect((await navigate(path)).ok).toBe(false)
  expect(uni.navigateTo).not.toHaveBeenCalled()
  expect(uni.switchTab).not.toHaveBeenCalled()
})

it('keeps feedback text caller-owned and ignores empty messages', () => {
  toast('')
  expect(uni.showToast).not.toHaveBeenCalled()
  toast('Unable to open page')
  expect(uni.showToast).toHaveBeenCalledWith({ title: 'Unable to open page', icon: 'none' })
})
