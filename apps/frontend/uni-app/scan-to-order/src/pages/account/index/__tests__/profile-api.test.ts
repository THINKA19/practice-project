import { beforeEach, expect, it, vi } from 'vitest'
import { profileApi } from '../composables/use-profile-requests'

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  post: vi.fn(),
  clear: vi.fn(),
  session: { sessionRevision: 1 },
}))
vi.mock('@/pages/auth/session', () => ({
  useSessionState: () => ({ ...mocks.session, clearSession: mocks.clear }),
  getAuthorizationHeaders: () => ({ Authorization: 'Bearer valid' }),
}))
vi.mock('@/http/alova', () => ({ http: {
  Get: () => ({ send: mocks.send }),
  Post: (...args: unknown[]) => {
    mocks.post(...args)
    return { send: mocks.send }
  },
} }))
beforeEach(() => {
  vi.clearAllMocks()
  mocks.send.mockResolvedValue({ gender: 'female', birthday: '' })
})
it('只提交性别生日，不修改账户头像昵称', async () => {
  await profileApi.save({ gender: 'female', birthday: '', nickname: '不应提交', avatar: '不应提交' } as Parameters<typeof profileApi.save>[0])
  expect(mocks.post.mock.calls[0][1]).toEqual({ gender: 'female', birthday: '' })
})
it.each(['read', 'save'] as const)('资料%s明确401时清理失效会话', async (action) => {
  mocks.send.mockRejectedValueOnce(new Error('请求错误[401]：请先登录顾客账号'))
  await expect(action === 'read' ? profileApi.read() : profileApi.save({ gender: 'unknown', birthday: '' })).rejects.toThrow()
  expect(mocks.clear).toHaveBeenCalledOnce()
})
it('普通网络失败不清理有效登录', async () => {
  mocks.send.mockRejectedValueOnce(new Error('网络连接失败'))
  await expect(profileApi.read()).rejects.toThrow()
  expect(mocks.clear).not.toHaveBeenCalled()
})
