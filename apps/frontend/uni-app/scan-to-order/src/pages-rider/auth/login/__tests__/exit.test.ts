import { afterEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import type { EffectScope } from 'vue'
import { useRiderLoginAuth } from '..'
import { useSessionState } from '@/pages/auth/session'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { sessionApi } from '@/pages/auth/session/api/session'

vi.mock('@/pages/auth/session/api/session', () => ({ sessionApi: { logout: vi.fn().mockResolvedValue(null) } }))
const scopes: EffectScope[] = []
function riderAuth() {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(useRiderLoginAuth)!
}
afterEach(() => scopes.splice(0).forEach(scope => scope.stop()))

it('取消退出保留身份，确认后清理唯一会话再返回我的页面', async () => {
  seedSession({}, 'rider')

  const auth = riderAuth()

  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: false, cancel: true, errMsg: '' })

  await auth.goBackClient()

  expect(useSessionState().identity).toBe('rider')

  expect(uni.reLaunch).not.toHaveBeenCalled()

  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: true, cancel: false, errMsg: '' })

  await auth.goBackClient()

  expect(useSessionState().identity).toBeNull()

  expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/account/index/index' })
})

it('确认框打开期间换号，旧确认不能退出新会话', async () => {
  seedSession({}, 'rider')
  const auth = riderAuth()
  let finish!: (value: UniApp.ShowModalRes) => void
  vi.mocked(uni.showModal).mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const pending = auth.logout()
  seedSession({ userId: 2 }, 'shop')
  finish({ confirm: true, cancel: false, errMsg: '' })
  await pending
  expect(useSessionState().identity).toBe('shop')
  expect(sessionApi.logout).not.toHaveBeenCalled()
  expect(uni.reLaunch).not.toHaveBeenCalled()
})

it('等待服务端注销期间重新登录，不用旧结果跳转新账号页面', async () => {
  seedSession({}, 'rider')
  const auth = riderAuth()
  let finish!: () => void
  vi.mocked(sessionApi.logout).mockReturnValueOnce(new Promise<void>((resolve) => {
    finish = resolve
  }))
  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: true, cancel: false, errMsg: '' })
  const pending = auth.goBackClient()
  await Promise.resolve()
  expect(useSessionState().identity).toBeNull()
  seedSession({ userId: 2 }, 'shop')
  finish()
  await pending
  expect(useSessionState().identity).toBe('shop')
  expect(uni.reLaunch).not.toHaveBeenCalled()
})

it('退出确认不能重复打开', async () => {
  seedSession({}, 'rider')
  const auth = riderAuth()
  let finish!: (value: UniApp.ShowModalRes) => void
  vi.mocked(uni.showModal).mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const pending = auth.logout()
  await auth.goBackClient()
  expect(uni.showModal).toHaveBeenCalledTimes(1)
  finish({ confirm: false, cancel: true, errMsg: '' })
  await pending
})
