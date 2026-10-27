import { beforeEach, expect, it, vi } from 'vitest'
import { enablePrivacyConsent, finishPrivacyConsent, setPrivacyChoice } from '../../agreement/composables/use-privacy-consent'
import { createSession, getIdentity, getToken, refreshSession, refreshUserInfo } from '../composables/use-actions'
import { useSessionState as sessionView } from '../composables/use-state'
import { sessionApi } from '../api/session'
import { seedSession } from './fixtures'
import { useTokenStore } from '@/store/token'

vi.mock('../api/session', () => ({ sessionApi: { profile: vi.fn(), refresh: vi.fn(), logout: vi.fn() } }))

beforeEach(() => {
  enablePrivacyConsent()
})

it('未知及拒绝状态屏蔽缓存顾客身份、资料和公共请求使用的凭证', async () => {
  seedSession({ nickname: 'private', avatar: 'https://example.com/private.png' }, 'customer', true)
  const session = sessionView()
  const token = useTokenStore()
  for (const reject of [false, true]) {
    if (reject)
      setPrivacyChoice(false)
    expect(getToken()).toBe('')
    expect(getIdentity()).toBeNull()
    expect(token.validToken).toBe('')
    expect(session.hasLogin).toBe(false)
    expect(session.tokenInfo).toBeNull()
    expect(session.userInfo.nickname).toBe('')
    await refreshUserInfo()
    await expect(refreshSession()).rejects.toThrow('隐私')
  }
  expect(sessionApi.profile).not.toHaveBeenCalled()
  expect(sessionApi.refresh).not.toHaveBeenCalled()
  setPrivacyChoice(true)
  expect(getToken()).toBe('old')
  expect(session.userInfo.nickname).toBe('private')
})

it.each(['shop', 'rider'] as const)('顾客拒绝不屏蔽 %s 会话', (identity) => {
  seedSession({}, identity)
  setPrivacyChoice(false)
  expect(getToken()).toBe('old')
  expect(getIdentity()).toBe(identity)
})

it('未同意时不执行登录兑换', async () => {
  const exchange = vi.fn()
  await expect(createSession('customer', exchange)).rejects.toThrow('隐私')
  expect(exchange).not.toHaveBeenCalled()
})

it('同意变化后丢弃正在加载的旧个人资料', async () => {
  setPrivacyChoice(true)
  seedSession({ nickname: 'old' })
  let resolve!: (user: { userId: number, username: string, nickname: string, identity: 'customer' }) => void
  vi.mocked(sessionApi.profile).mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const task = refreshUserInfo()
  setPrivacyChoice(false)
  setPrivacyChoice(true)
  resolve({ userId: 1, username: 'u', nickname: 'late', identity: 'customer' })
  expect(await task).toBeUndefined()
  expect(sessionView().userInfo.nickname).toBe('old')
})

it('登录兑换过程中拒绝后不再获取资料或提交会话', async () => {
  setPrivacyChoice(true)
  let resolve!: (token: { token: string, expiresIn: number }) => void
  const task = createSession('customer', () => new Promise((done) => {
    resolve = done
  }))
  finishPrivacyConsent(false)
  resolve({ token: 'candidate', expiresIn: 3600 })
  await expect(task).rejects.toThrow('取消')
  expect(sessionApi.profile).not.toHaveBeenCalled()
  expect(getToken()).toBe('')
})
