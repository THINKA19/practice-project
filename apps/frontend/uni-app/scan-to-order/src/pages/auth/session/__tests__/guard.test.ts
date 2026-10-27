import { expect, it, vi } from 'vitest'
import { requireIdentity } from '../composables/use-guard'
import { getIdentity, getToken } from '../composables/use-actions'
import { seedSession } from './fixtures'
import { useTokenStore } from '@/store/token'
import { redirectToLogin } from '../composables/use-login-navigation'

vi.mock('../composables/use-login-navigation', () => ({ redirectToLogin: vi.fn() }))
vi.mock('../api/session', () => ({ sessionApi: { profile: vi.fn(), refresh: vi.fn(), logout: vi.fn() } }))

it('未登录引导目标登录页，身份不符只提示退出', () => {
  expect(requireIdentity('shop')).toBe(false)
  expect(redirectToLogin).toHaveBeenCalledWith({ identity: 'shop' })
  vi.mocked(redirectToLogin).mockClear()
  seedSession({}, 'rider')
  expect(requireIdentity('shop')).toBe(false)
  expect(redirectToLogin).not.toHaveBeenCalled()
  expect(uni.showToast).toHaveBeenCalledWith({ title: '请先退出当前身份', icon: 'none' })
  expect(requireIdentity('rider')).toBe(true)
})

it('脚手架兼容入口读取同一凭证，失效清理同步清除业务会话', () => {
  seedSession({}, 'shop', true)
  const token = useTokenStore()
  expect(token.updateNowTime().validToken).toBe(getToken())
  expect(token.tokenInfo).toMatchObject({ accessToken: 'old', refreshToken: 'refresh' })
  token.logout()
  expect(getIdentity()).toBeNull()
  expect(getToken()).toBe('')
  expect(token.tokenInfo).toBeNull()
})
