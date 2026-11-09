import { toAddCartRequest } from '../models/mappers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cartApi } from '@/pages/ordering/menu-cart'
import { http } from '@/http/alova'

vi.mock('@/pages/auth/session', async original => ({ ...await original<typeof import('@/pages/auth/session')>(), getAuthorizationHeaders: () => ({ Authorization: 'Bearer wx-demo-session-ordering' }) }))

beforeEach(() => {
  vi.restoreAllMocks()
})
describe('cart 接口契约', () => {
  it('购物车仍序列化规格和加料，不丢失时段或类型', async () => {
    const post = vi.spyOn(http, 'Post').mockResolvedValue(null)

    const sku = [{ optionId: 1, optionValueId: 2 }]

    const addition = [{ pid: 3, id: 4 }]

    await cartApi.add(toAddCartRequest({ goodsId: 9, number: 2, sku, addition, goodsTimesDay: '2026-10-09', goodsTimesItem: '午市' }), 'table')

    expect(post).toHaveBeenCalledWith('/shopping-cart/add', {
      goodsId: 9,
      number: 2,
      sku: JSON.stringify(sku),
      addition: JSON.stringify(addition),
      goodsTimesDay: '2026-10-09',
      goodsTimesItem: '午市',
      type: 'table',
    }, { cacheFor: 0, headers: { Authorization: 'Bearer wx-demo-session-ordering' }, meta: { ignoreAuth: true } })
  })
})
