import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { EffectScope } from 'vue'
import { effectScope } from 'vue'
import { ClientRoutes } from '@/pages/routes'
import { ShopRoutes } from '@/pages-shop/routes'
import { useSessionState } from '@/pages/auth/session'
import { sessionApi } from '@/pages/auth/session/api/session'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useShopExit } from '../composables/use-exit'

vi.mock('@/pages/auth/session/api/session', () => ({ sessionApi: { logout: vi.fn().mockResolvedValue(null) } }))

let scope: EffectScope
beforeEach(() => { scope = effectScope() })
afterEach(() => scope.stop())

it('返回箭头取消时保留商家身份，确认后退出并回到客户端我的', async () => {
  seedSession({}, 'shop')
  const page = scope.run(useShopExit)!
  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: false, cancel: true, errMsg: '' })

  await page.goBackClient()
  expect(useSessionState().identity).toBe('shop')
  expect(uni.reLaunch).not.toHaveBeenCalled()

  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: true, cancel: false, errMsg: '' })
  await page.goBackClient()
  expect(useSessionState().identity).toBeNull()
  expect(uni.reLaunch).toHaveBeenCalledWith({ url: ClientRoutes.Account.my })
})

it('退出账号时，服务端注销失败仍清除本地会话并回到商家登录', async () => {
  seedSession({}, 'shop')
  const page = scope.run(useShopExit)!
  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: true, cancel: false, errMsg: '' })
  vi.mocked(sessionApi.logout).mockRejectedValueOnce(new Error('offline'))

  await page.logout()

  expect(useSessionState().identity).toBeNull()
  expect(uni.showToast).toHaveBeenCalled()
  expect(uni.reLaunch).toHaveBeenCalledWith({ url: ShopRoutes.Access.login })
})
