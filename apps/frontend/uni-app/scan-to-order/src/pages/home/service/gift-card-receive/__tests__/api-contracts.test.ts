/**
 * ============================================================================
 * 【文件概述】领取接口契约回归，确保预览保留只读标识。
 * 【方法与导出清单】无生产导出；Vitest 回归用例。
 * 【综合使用示例】
 * import { cardReceiveApi } from '../api/receive.api'
 * // 使用客户端替身检查实际请求方法、参数与缓存选项。
 * ============================================================================
 */
import { beforeEach, expect, it, vi } from 'vitest'
import { cardReceiveApi } from '../api/receive.api'
import { http } from '@/http/alova'

vi.mock('@/http/alova', () => ({ http: { Get: vi.fn(), Post: vi.fn() }, API_DOMAINS: { SECONDARY: 'https://common.test' } }))
vi.mock('@/pages/auth/session', () => ({ getAuthorizationHeaders: () => ({ Authorization: 'Bearer customer-token' }) }))
beforeEach(() => {
  vi.clearAllMocks()
})
it('领取预览保留 calculate=true，未当作正式领取提交', async () => {
  vi.mocked(http.Post).mockReturnValue({ send: () => Promise.resolve({}) } as never)

  await cardReceiveApi.fetchShare({ id: 3, shareToken: 'share-token', calculate: true })

  expect(http.Post).toHaveBeenCalledWith('/card/share/fetch', { id: 3, shareToken: 'share-token', calculate: true }, expect.objectContaining({ cacheFor: 0 }))
})
