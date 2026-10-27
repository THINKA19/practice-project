import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addressApi } from '../composables/use-requests'
import { API_DOMAINS, http } from '@/http/alova'

vi.mock('@/http/alova', () => ({ http: { Get: vi.fn(), Post: vi.fn() }, API_DOMAINS: { SECONDARY: 'https://common.test' } }))
vi.mock('@/pages/auth/session', () => ({ getAuthorizationHeaders: () => ({ Authorization: 'Bearer customer-token' }) }))
beforeEach(() => {
  vi.clearAllMocks()
})
describe('地址接口契约', () => {
  it('设置默认地址使用 common 域名、真实凭证和字符串 true，禁用缓存', async () => {
    vi.mocked(http.Post).mockReturnValue({ send: () => Promise.resolve(null) } as never)

    await addressApi.setDefault(37)

    expect(http.Post).toHaveBeenCalledWith('/user/shipping-address/update', { id: 37, isDefault: 'true' }, expect.objectContaining({ headers: { Authorization: 'Bearer customer-token' }, cacheFor: 0, meta: expect.objectContaining({ domain: API_DOMAINS.SECONDARY }) }))
  })

  it('地址列表允许空数据，请求失败仍向页面抛出', async () => {
    vi.mocked(http.Post).mockReturnValue({ send: () => Promise.resolve(null) } as never)

    expect(await addressApi.list()).toEqual([])

    const failure = new Error('failed')

    vi.mocked(http.Post).mockReturnValue({ send: () => Promise.reject(failure) } as never)

    await expect(addressApi.setDefault(37)).rejects.toBe(failure)
  })
})

it('列表默认标记 false 字符串不会误显示默认地址', async () => {
  vi.mocked(http.Post).mockReturnValue({ send: () => Promise.resolve({ result: [
    { id: 1, isDefault: 'false' },
    { id: 2, isDefault: 'true' },
    { id: 3, isDefault: 0 },
  ] }) } as never)
  expect((await addressApi.list()).map(row => row.isDefault)).toEqual([false, true, false])
})
