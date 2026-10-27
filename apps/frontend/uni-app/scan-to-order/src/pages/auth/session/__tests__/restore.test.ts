import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { getIdentity, getToken, restoreSession } from '../composables/use-actions'
import { useSessionStore } from '../composables/use-store'

vi.mock('../api/session', () => ({ sessionApi: {} }))

function installPersistence(data: Record<string, string>) {
  vi.mocked(uni.getStorageSync).mockImplementation(key => data[key] ?? null)
  vi.mocked(uni.removeStorageSync).mockImplementation((key) => {
    delete data[key]
  })
  const pinia = createPinia()
  pinia.use(createPersistedState({ storage: {
    getItem: key => data[key] ?? null,
    setItem: (key, value) => { data[key] = value },
  } }))
  createApp({}).use(pinia)
  setActivePinia(pinia)
}

function snapshot(identity: 'customer' | 'shop' | 'rider', expiresAt = Date.now() + 60000) {
  return { version: 1, identity, tokenInfo: { token: 'saved', expiresIn: 3600 }, userInfo: { userId: 1, username: 'u', nickname: 'U', identity }, expiresAt, refreshExpiresAt: 0 }
}

afterEach(() => {
  vi.mocked(uni.getStorageSync).mockReset().mockReturnValue(null)
  vi.mocked(uni.removeStorageSync).mockReset()
})

it.each(['customer', 'shop', 'rider'] as const)('首次业务读取自动恢复 %s，无需启动入口调用', (identity) => {
  installPersistence({ 'auth-session': JSON.stringify({ snapshot: snapshot(identity) }) })
  expect(getIdentity()).toBe(identity)
  expect(getToken()).toBe('saved')
  expect(useSessionStore().restored).toBe(true)
})

it('没有新存储时迁移旧顾客数据，持久化后清理旧键且不重复迁移', () => {
  const data: Record<string, string> = {
    token: JSON.stringify({ tokenInfo: { token: 'legacy', expiresIn: 3600 } }),
    user: JSON.stringify({ userInfo: { userId: 1, username: 'u', nickname: 'U' } }),
    accessTokenExpireTime: String(Date.now() + 60000),
  }
  installPersistence(data)
  expect(getToken()).toBe('legacy')
  expect(getIdentity()).toBe('customer')
  expect(JSON.parse(data['auth-session']).snapshot.tokenInfo.token).toBe('legacy')
  expect(data.token).toBeUndefined()
  const reads = vi.mocked(uni.getStorageSync).mock.calls.length
  restoreSession()
  expect(vi.mocked(uni.getStorageSync).mock.calls.length).toBe(reads)
})

it.each([
  ['过期', JSON.stringify({ snapshot: snapshot('shop', Date.now() - 1) })],
  ['损坏结构', JSON.stringify({ snapshot: { identity: 'unknown' } })],
  ['损坏 JSON', '{'],
])('拒绝%s会话并持久化空状态', (_, value) => {
  const data = { 'auth-session': value }
  installPersistence(data)
  expect(getToken()).toBe('')
  expect(getIdentity()).toBeNull()
  expect(JSON.parse(data['auth-session']).snapshot).toBeNull()
})

it('显式重新加载存储时再次校验，清除失效会话', () => {
  const data = { 'auth-session': JSON.stringify({ snapshot: snapshot('rider') }) }
  installPersistence(data)
  expect(getIdentity()).toBe('rider')
  data['auth-session'] = JSON.stringify({ snapshot: snapshot('rider', Date.now() - 1) })
  useSessionStore().$hydrate()
  expect(getIdentity()).toBeNull()
  expect(getToken()).toBe('')
})
