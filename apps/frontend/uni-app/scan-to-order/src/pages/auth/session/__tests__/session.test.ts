import { expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { clearSession, createSession, getIdentity, getToken, refreshSession, restoreSession, useSessionState } from '../index'
import { useSessionStore } from '../composables/use-store'
import { sessionApi } from '../api/session'
import { seedSession } from './fixtures'
import { useTokenStore } from '@/store/token'

vi.mock('../api/session', () => ({ sessionApi: { profile: vi.fn(), refresh: vi.fn(), logout: vi.fn() } }))

function authenticate(target: 'customer' | 'shop' | 'rider', exchange: () => Promise<{ token: string, expiresIn: number }>, loadUser?: () => Promise<ReturnType<typeof user>>) {
  if (loadUser)
    vi.mocked(sessionApi.profile).mockImplementation(loadUser)

  return createSession(target, exchange)
}
const credential = { token: 'valid', expiresIn: 3600 }

const user = (identity: 'customer' | 'shop' | 'rider') => ({ userId: 1, username: 'u', nickname: 'U', identity })

it('脚手架 Token 入口跟随唯一会话登录、过期与退出状态', async () => {
  const token = useTokenStore()
  expect(token.hasLogin).toBe(false)
  await authenticate('customer', async () => credential, async () => user('customer'))
  expect(token.hasLogin).toBe(true)
  const now = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 3601_000)
  try {
    expect(token.hasLogin).toBe(false)
  }
  finally {
    now.mockRestore()
  }
  clearSession()
  expect(token.hasLogin).toBe(false)
})

function deferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>((done) => {
    resolve = done
  })

  return { resolve, promise }
}
it.each(['customer', 'shop', 'rider'] as const)('唯一会话支持 %s 身份，禁止叠加其他身份', async (identity) => {
  await authenticate(identity, async () => credential, async () => user(identity))

  expect(getIdentity()).toBe(identity)

  expect(getToken()).toBe('valid')

  const exchange = vi.fn(async () => credential)

  await expect(authenticate('customer', exchange)).rejects.toThrow('先退出')

  expect(exchange).not.toHaveBeenCalled()

  clearSession()

  expect(getToken()).toBe('')

  expect(getIdentity()).toBeNull()
})

it('服务端身份不匹配时不提交凭证', async () => {
  await expect(authenticate('shop', async () => credential, async () => user('rider'))).rejects.toThrow('不匹配')

  expect(getToken()).toBe('')

  expect(getIdentity()).toBeNull()
})

it('退出后旧登录响应不能覆盖新身份', async () => {
  const old = deferred<typeof credential>()

  const pending = authenticate('customer', () => old.promise, async () => user('customer'))

  const failed = expect(pending).rejects.toThrow('取消')

  clearSession()

  await authenticate('rider', async () => credential, async () => user('rider'))

  old.resolve(credential)

  await failed

  expect(getIdentity()).toBe('rider')
})

it('并发登录只执行一次凭证交换', async () => {
  const wait = deferred<typeof credential>()

  const first = authenticate('shop', () => wait.promise, async () => user('shop'))

  const second = vi.fn(async () => credential)

  await expect(authenticate('rider', second)).rejects.toThrow('正在登录')

  expect(second).not.toHaveBeenCalled()

  wait.resolve(credential)

  await first
})

it('并发刷新合并，退出后的旧刷新不得恢复状态', async () => {
  seedSession({}, 'customer', true)

  const response = deferred<{
    accessToken: string
    refreshToken: string
    accessExpiresIn: number
    refreshExpiresIn: number
  }>()

  vi.mocked(sessionApi.refresh).mockReturnValue(response.promise)

  const first = refreshSession()

  const second = refreshSession()

  expect(first).toBe(second)

  expect(sessionApi.refresh).toHaveBeenCalledTimes(1)

  const failed = expect(first).rejects.toThrow('会话已变化')

  clearSession()

  seedSession({}, 'rider')

  response.resolve({ accessToken: 'new', refreshToken: 'r', accessExpiresIn: 3600, refreshExpiresIn: 7200 })

  await failed

  expect(getIdentity()).toBe('rider')
})

it('读取状态不能修改内部用户资料', () => {
  seedSession()

  const session = useSessionState()

  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {

  })

  Reflect.set(session.userInfo, 'nickname', 'changed')

  expect(useSessionStore().snapshot?.userInfo.nickname).toBe('U')

  warn.mockRestore()
})

it('兼容旧顾客持久化数据，拒绝未知身份及过期数据', () => {
  const storage: Record<string, unknown> = { token: JSON.stringify({ tokenInfo: credential }), user: JSON.stringify({ userInfo: { userId: 1, username: 'u', nickname: 'U' } }), accessTokenExpireTime: Date.now() + 60000 }

  vi.mocked(uni.getStorageSync).mockImplementation(key => storage[key])

  restoreSession()

  expect(getIdentity()).toBe('customer')

  expect(uni.removeStorageSync).toHaveBeenCalledWith('token')

  clearSession()

  const state = useSessionStore()

  state.restored = false

  storage.token = JSON.stringify({ tokenInfo: credential, identity: 'administrator' })

  restoreSession()

  expect(getIdentity()).toBeNull()

  vi.mocked(uni.getStorageSync).mockReset().mockReturnValue(null)
})

it('会话与旧 Token 入口在时间推进后同步失效，无需手动更新时间', () => {
  seedSession()
  const session = useSessionState()
  const token = useTokenStore()
  const visibleLogin = computed(() => session.hasLogin)
  const visibleToken = computed(() => session.validToken)
  expect(session.hasLogin).toBe(true)
  expect(session.validToken).toBe('old')
  expect(visibleLogin.value).toBe(true)
  expect(visibleToken.value).toBe('old')
  const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 3601_000)
  try {
    expect(session.hasLogin).toBe(false)
    expect(session.validToken).toBe('')
    expect(token.hasLogin).toBe(false)
    session.updateNowTime()
    expect(visibleLogin.value).toBe(false)
    expect(visibleToken.value).toBe('')
  }
  finally {
    clock.mockRestore()
  }
})
