import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('通过正式发现机制加载关于我们，未知 key 保持空内容', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { cmsApi } = await import('../composables/use-requests')
  const page = await cmsApi.cmsPage('about')
  expect(page?.info.title).toBe('关于我们')
  expect(page?.info.content).toContain('开发示例')
  expect(await cmsApi.cmsPage('unknown-key')).toBeNull()
  expect(uni.request).not.toHaveBeenCalled()
})
