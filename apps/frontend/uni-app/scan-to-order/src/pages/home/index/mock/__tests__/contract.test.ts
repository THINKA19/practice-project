import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(uni.request).mockReset()
})
describe('首页 Mock 接入契约', () => {
  it('首页轮播 API 经过 Mock 返回三张本地图片，其他类型为空且不访问网络', async () => {
    vi.resetModules()
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_USE_MOCK', 'true')
    const { bannerApi } = await import('@/pages/home/index/composables/use-requests')
    const banners = await bannerApi.banners('shouye')
    expect(banners.map(item => item.picUrl)).toEqual([
      '/src/mock/assets/images/home/banner/01.jpeg',
      '/src/mock/assets/images/home/banner/02.jpeg',
      '/src/mock/assets/images/home/banner/03.jpeg',
    ])
    expect(await bannerApi.banners('card')).toEqual([])
    expect(uni.request).not.toHaveBeenCalled()
  })
})

beforeEach(() => resetAllMocks())
