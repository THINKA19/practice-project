import { beforeEach, describe, expect, it, vi } from 'vitest'
import { orderApi } from '../composables/use-requests'
import { http } from '@/http/alova'

vi.mock('@/http/alova', () => ({ http: { Get: vi.fn(), Post: vi.fn() }, API_DOMAINS: { SECONDARY: 'https://common.test' } }))
vi.mock('@/pages/auth/session', () => ({ AUTH_ROUTES: { customer: '/pages/auth/login/index' }, getAuthorizationHeaders: () => ({ Authorization: 'Bearer customer-token' }) }))
beforeEach(() => {
  vi.clearAllMocks()
})
describe('订单接口契约', () => {
  it('试算不变更 calculate，下单参数原样传递', async () => {
    vi.mocked(http.Post).mockReturnValue({ send: () => Promise.resolve({ amountReal: 12 }) } as never)

    const data = { calculate: 'true', goodsJsonStr: '[{"goodsId":9,"number":1}]', shopId: 3 }

    await orderApi.create(data)

    expect(http.Post).toHaveBeenCalledWith('/order/create', data, expect.objectContaining({ headers: { Authorization: 'Bearer customer-token' }, cacheFor: 0 }))
  })

  it('删除操作保留 orderId，不改成取消操作', async () => {
    vi.mocked(http.Post).mockReturnValue({ send: () => Promise.resolve(null) } as never)

    await orderApi.remove(9)

    expect(http.Post).toHaveBeenCalledWith('/order/delete', { orderId: 9 }, expect.any(Object))
  })

  it('失败写入向上传递', async () => {
    const failure = new Error('failed')

    vi.mocked(http.Post).mockReturnValue({ send: () => Promise.reject(failure) } as never)

    await expect(orderApi.close(9)).rejects.toBe(failure)
  })
})
