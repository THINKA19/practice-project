import { beforeEach, expect, it, vi } from 'vitest'
import { cardApi } from '../composables/use-requests'
import { http } from '@/http/alova'

vi.mock('@/http/alova', () => ({ http: { Get: vi.fn(), Post: vi.fn() }, API_DOMAINS: { SECONDARY: 'https://common.test' } }))
vi.mock('@/pages/auth/session', () => ({ getAuthorizationHeaders: () => ({ Authorization: 'Bearer customer-token' }) }))
beforeEach(() => {
  vi.clearAllMocks()
})
it('领取预览保留 calculate=true，未当作正式领取提交', async () => {
  vi.mocked(http.Post).mockReturnValue({ send: () => Promise.resolve({}) } as never)

  await cardApi.fetchShare(3, 'share-token', true)

  expect(http.Post).toHaveBeenCalledWith('/card/share/fetch', { id: 3, shareToken: 'share-token', calculate: true }, expect.objectContaining({ cacheFor: 0 }))
})
