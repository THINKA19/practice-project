import { beforeEach, describe, expect, it, vi } from 'vitest'
import { orderApi } from '../composables/use-requests'
import { http } from '@/http/alova'

vi.mock('@/http/alova', () => ({ http: { Get: vi.fn(), Post: vi.fn() }, API_DOMAINS: { SECONDARY: 'https://common.test' } }))
vi.mock('@/pages/auth/session', () => ({ AUTH_ROUTES: { customer: '/pages/auth/login/index' }, getAuthorizationHeaders: () => ({ Authorization: 'Bearer customer-token' }) }))
beforeEach(() => {
  vi.clearAllMocks()
})
describe('订单接口契约', () => {
  it('旧订单按自身门店补查照片与币种，同店合并一次且保留已有快照', async () => {
    vi.mocked(http.Post).mockReturnValue({ send: async () => ({ orderList: [{ id: 1, shopId: 7 }, { id: 2, shopId: 7 }, { id: 3, shopId: 8, countryCode: 'TH', shopImage: '/kept.jpg', shopNameZt: '原门店' }], goodsMap: {} }) } as never)
    vi.mocked(http.Get).mockReturnValue({ send: async () => ({ info: { id: 7, countryCode: 'VN', name: '七号门店', pic: '/shop-seven.jpg' } }) } as never)
    const result = await orderApi.list({})
    expect(http.Get).toHaveBeenCalledTimes(1)
    expect(http.Get).toHaveBeenCalledWith('/shop/subshop/detail', expect.objectContaining({ params: { id: 7 } }))
    expect(result.orderList[0]).toMatchObject({ countryCode: 'VN', shopImage: '/shop-seven.jpg', shopNameZt: '七号门店' })
    expect(result.orderList[2]).toMatchObject({ countryCode: 'TH', shopImage: '/kept.jpg' })
  })

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
