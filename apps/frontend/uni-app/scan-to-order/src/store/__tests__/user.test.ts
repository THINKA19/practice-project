import { expect, it, vi } from 'vitest'
import { useUserStore } from '../user'
import { useTokenStore } from '../token'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { sessionApi } from '@/pages/auth/session/api/session'
import { clearSession, useSession } from '@/pages/auth/session'

vi.mock('@/pages/auth/session/api/session', () => ({ sessionApi: { profile: vi.fn(), refresh: vi.fn(), logout: vi.fn() } }))

it('未登录时返回默认资料，不建立独立 user 状态', () => {
  expect(useUserStore().userInfo).toMatchObject({ userId: -1, username: '', avatar: '/static/images/default-avatar.png' })
})

it.each(['customer', 'shop', 'rider'] as const)('旧资料入口跟随 %s 会话及退出', (identity) => {
  const user = useUserStore()
  const token = useTokenStore()
  seedSession({ nickname: '当前账号' }, identity)
  expect(user.userInfo).toEqual(useSession().userInfo)
  expect(token.validToken).toBe('old')
  clearSession()
  expect(user.userInfo.userId).toBe(-1)
  expect(token.validToken).toBe('')
})

it('清理资料同时清理凭证，且不请求服务端注销', () => {
  seedSession()
  useUserStore().clearUserInfo()
  expect(useTokenStore().hasLogin).toBe(false)
  expect(sessionApi.logout).not.toHaveBeenCalled()
})

it('资料刷新写入同一快照，不允许读取方直接修改', async () => {
  const state = seedSession()
  vi.mocked(sessionApi.profile).mockResolvedValue({ userId: 1, username: 'u', nickname: '新资料', identity: 'customer' })
  const user = useUserStore()
  await user.fetchUserInfo()
  expect(state.snapshot?.userInfo.nickname).toBe('新资料')
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  try {
    Reflect.set(user.userInfo, 'nickname', '篡改')
    expect(state.snapshot?.userInfo.nickname).toBe('新资料')
  }
  finally {
    warn.mockRestore()
  }
})

it('切换账号后丢弃旧资料响应', async () => {
  seedSession()
  let resolve!: (value: Awaited<ReturnType<typeof sessionApi.profile>>) => void
  vi.mocked(sessionApi.profile).mockReturnValue(new Promise((done) => {
    resolve = done
  }))
  const pending = useUserStore().fetchUserInfo()
  clearSession()
  seedSession({ userId: 2 }, 'rider')
  resolve({ userId: 1, username: 'old', nickname: '旧资料', identity: 'customer' })
  await pending
  expect(useUserStore().userInfo.userId).toBe(2)
})

it('刷新资料不能把当前会话替换为同端其他账号', async () => {
  seedSession()
  vi.mocked(sessionApi.profile).mockResolvedValue({ userId: 2, username: 'other', nickname: '其他账号', identity: 'customer' })
  await expect(useUserStore().fetchUserInfo()).rejects.toThrow('会话身份资料无效')
  expect(useUserStore().userInfo.userId).toBe(1)
})

it('资料刷新结果与会话状态隔离，包括嵌套角色和等级', async () => {
  seedSession()
  vi.mocked(sessionApi.profile).mockResolvedValue({ userId: 1, username: 'u', nickname: 'U', identity: 'customer', roles: ['customer'], userLevel: { name: '普通' } })
  const result = await useUserStore().fetchUserInfo()
  result!.nickname = '篡改'
  result!.roles!.push('admin')
  result!.userLevel!.name = '篡改等级'
  expect(useUserStore().userInfo).toMatchObject({ nickname: 'U', roles: ['customer'], userLevel: { name: '普通' } })
})

it('凭证刷新不得覆盖刷新期间已经更新的资料', async () => {
  seedSession({}, 'customer', true)
  let resolve!: (value: Awaited<ReturnType<typeof sessionApi.refresh>>) => void
  vi.mocked(sessionApi.refresh).mockReturnValue(new Promise((done) => {
    resolve = done
  }))
  const pending = useTokenStore().refreshToken()
  vi.mocked(sessionApi.profile).mockResolvedValue({ userId: 1, username: 'u', nickname: '最新资料', identity: 'customer' })
  await useUserStore().fetchUserInfo()
  resolve({ accessToken: 'new', refreshToken: 'refresh', accessExpiresIn: 3600, refreshExpiresIn: 7200 })
  await pending
  expect(useUserStore().userInfo.nickname).toBe('最新资料')
})
