import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { toLoginPage } from '../toLoginPage'

beforeEach(() => {
  vi.stubGlobal('getCurrentPages', () => [{ route: 'pages/pickup/index/index', $page: { fullPath: '/pages/pickup/index/index?order=1' } }])
})
afterEach(() => {
  toLoginPage.cancel()
  vi.unstubAllGlobals()
})
it('preserves the current destination when opening login manually', () => {
  toLoginPage()
  toLoginPage.flush()
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: `/pages/auth/login/index?redirect=${encodeURIComponent('/pages/pickup/index/index?order=1')}` })
})
it('preserves an explicitly supplied redirect', () => {
  toLoginPage({ queryString: '?redirect=%2Fpages%2Fhome%2Findex%2Findex' })
  toLoginPage.flush()
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/auth/login/index?redirect=%2Fpages%2Fhome%2Findex%2Findex' })
})
