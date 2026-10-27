import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({ AUTH_ROUTES: { customer: '/pages/auth/login/index' }, getIdentity: () => 'customer', getToken: () => 'wx-demo-session-feedback-test', getAuthorizationHeaders: () => ({ Authorization: 'Bearer wx-demo-session-feedback-test' }), getSessionRevision: () => 1 }))
afterEach(() => vi.unstubAllEnvs())

it('反馈与附件沿真实 Alova Mock 链路提交，空内容不能成功', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { submitFeedback } = await import('../composables/use-actions')
  const { feedbackApi } = await import('../composables/use-requests')
  await expect(submitFeedback({ name: '测试顾客', content: '餐品建议', files: ['/tmp/a.jpg', '/tmp/a.mp4'] })).resolves.toEqual({ submitted: true, demo: true })
  await expect(feedbackApi.submit({ name: '测试顾客', content: ' ', files: [] })).rejects.toThrow('请填写反馈内容')
  expect(uni.request).not.toHaveBeenCalled()
  expect(uni.uploadFile).not.toHaveBeenCalled()
}, 15000)
