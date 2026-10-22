import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import * as api from '@/api/login'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

vi.mock('@/api/login', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  wxLogin: vi.fn(),
  getWxCode: vi.fn(),
  getUserInfo: vi.fn(),
  refreshToken: vi.fn(),
}))
const tokens = { token: 'credential', expiresIn: 3600 }
const customer = { userId: 1, username: 'c', nickname: 'Customer' }
const saved = new Map<string, any>()
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
beforeEach(() => {
  saved.clear()
  vi.mocked(uni.getStorageSync).mockImplementation(key => saved.get(key))
  vi.mocked(uni.setStorageSync).mockImplementation((key, value) => {
    saved.set(key, value)
  })
  vi.mocked(uni.removeStorageSync).mockImplementation((key) => {
    saved.delete(key)
  })
  vi.mocked(api.login).mockResolvedValue(tokens)
  vi.mocked(api.getUserInfo).mockResolvedValue(customer)
  vi.mocked(api.logout).mockResolvedValue(undefined)
})

it('原顾客登录复用 token/user store，阻止后台登录且不调用认证请求', async () => {
  const store = useTokenStore()
  await store.login({ username: 'c', password: 'p' })
  expect(store.identity).toBe('customer')
  expect(store.validToken).toBe(tokens.token)
  expect(useUserStore().userInfo.userId).toBe(1)
  const request = vi.fn().mockResolvedValue(tokens)
  await expect(store.authenticate('shop', request)).rejects.toThrow('先退出')
  expect(request).not.toHaveBeenCalled()
})

it.each(['shop', 'rider'] as const)('后台 %s 身份互斥，顾客自动登录不能覆盖', async (identity) => {
  vi.mocked(api.getUserInfo).mockResolvedValue({ ...customer, identity })
  const store = useTokenStore()
  await store.authenticate(identity, async () => tokens)
  await expect(store.login({ username: 'c', password: 'p' })).rejects.toThrow('先退出')
  await expect(store.wxLogin()).rejects.toThrow('先退出')
  await expect(store.authenticate(identity === 'shop' ? 'rider' : 'shop', async () => tokens)).rejects.toThrow('先退出')
  expect(store.identity).toBe(identity)
  expect(api.getWxCode).not.toHaveBeenCalled()
})

it('服务端身份不匹配不能提交，失败不会留下候选 token', async () => {
  const store = useTokenStore()
  await expect(store.authenticate('shop', async () => tokens)).rejects.toThrow('不匹配')
  expect(store.identity).toBeNull()
  expect(store.validToken).toBe('')
  expect(store.authenticating).toBe(false)
})

it('并发登录只执行第一个，退出后迟到资料不会恢复旧身份', async () => {
  const pending = deferred<typeof customer>()
  vi.mocked(api.getUserInfo).mockReturnValueOnce(pending.promise)
  const store = useTokenStore()
  const first = store.login({ username: 'c', password: 'p' })
  await Promise.resolve()
  const rejected = expect(first).rejects.toThrow('取消')
  const request = vi.fn().mockResolvedValue(tokens)
  await expect(store.authenticate('shop', request)).rejects.toThrow('正在登录')
  expect(request).not.toHaveBeenCalled()
  store.clearSession()
  pending.resolve(customer)
  await rejected
  expect(store.identity).toBeNull()
  expect(useUserStore().userInfo.userId).toBe(-1)
})

it('退出立即清理，迟到退出响应不能清除新会话', async () => {
  const store = useTokenStore()
  await store.login({ username: 'c', password: 'p' })
  const pending = deferred<void>()
  vi.mocked(api.logout).mockReturnValueOnce(pending.promise)
  const logout = store.logout()
  expect(store.identity).toBeNull()
  vi.mocked(api.getUserInfo).mockResolvedValue({ ...customer, identity: 'rider' })
  await store.authenticate('rider', async () => tokens)
  pending.resolve()
  await logout
  expect(store.identity).toBe('rider')
})

it('现有 Pinia 持久化恢复唯一身份，不使用独立角色凭证键', async () => {
  const activate = () => {
    const pinia = createPinia()
    pinia.use(createPersistedState({ storage: {
      getItem: key => saved.get(key) ?? null,
      setItem: (key, value) => {
        saved.set(key, value)
      },
    } }))
    createApp({}).use(pinia)
    setActivePinia(pinia)
    return useTokenStore()
  }
  vi.mocked(api.getUserInfo).mockResolvedValue({ ...customer, identity: 'shop' })
  const first = activate()
  await first.authenticate('shop', async () => tokens)
  first.$persist()
  const restored = activate()
  expect(restored.identity).toBe('shop')
  expect(restored.validToken).toBe(tokens.token)
  expect(saved.has('operator-credentials')).toBe(false)
  restored.clearSession()
  restored.$persist()
  expect(activate().identity).toBeNull()
})
