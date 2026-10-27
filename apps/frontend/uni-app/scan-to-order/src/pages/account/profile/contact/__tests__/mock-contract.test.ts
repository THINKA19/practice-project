import { readFile } from 'node:fs/promises'
import { afterEach, expect, it, vi } from 'vitest'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())
it('经真实发现机制加载九种渠道，每种二维码均有本地图片而非空链接', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { contactApi } = await import('../composables/use-requests')
  const data = await contactApi.config()
  expect(data.demo).toBe(true)
  expect(data.channels.map(item => item.kind)).toEqual(['wechat', 'wechat_official', 'qq', 'qq_group', 'telegram', 'facebook', 'x', 'whatsapp', 'instagram'])
  for (const item of data.channels) {
    expect(item.account).toMatch(/^@?DEMO_/)
    const file = await readFile(`src${item.qr_image}`)
    expect(file.subarray(1, 4).toString()).toBe('PNG')
  }
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)
