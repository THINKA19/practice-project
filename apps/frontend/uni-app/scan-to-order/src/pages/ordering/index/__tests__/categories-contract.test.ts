/** 分类与收藏真实请求链回归：公开优惠、分页前筛选及顾客隔离。 */
import { expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ token: '' }))
vi.mock('@/pages/auth/session', async (original) => {
  const actual = await original<typeof import('@/pages/auth/session')>()
  return {
    ...actual,
    getAuthorizationHeaders: () => {
      if (!auth.token)
        throw new Error('请先登录')
      return { Authorization: `Bearer ${auth.token}` }
    },
  }
})

it('游客可分页查看优惠，只有新开业但无优惠的门店不进入活动列表', async () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { shopApi } = await import('../api/shop.api')
  auth.token = ''
  const first = await shopApi.fetchShops({ category: 'promotions', page: 1, pageSize: 6 })
  const second = await shopApi.fetchShops({ category: 'promotions', page: 2, pageSize: 6 })
  expect(first).toHaveLength(6)
  expect(second.length).toBeGreaterThan(0)
  expect([...first, ...second].every(shop => !!shop.promotions?.length)).toBe(true)
  expect(new Set([...first, ...second].map(shop => shop.id)).size).toBe(first.length + second.length)
  expect(first.some(shop => shop.openingState === 'new')).toBe(true)
  const scoped = await shopApi.fetchShops({ category: 'promotions', countryCode: 'VN', cityCode: 'VN-SGN', nameLike: '示范路', page: 1, pageSize: 6 })
  expect(scoped.map(shop => shop.id)).toEqual([101, 102])
  expect(uni.request).not.toHaveBeenCalled()
}, 30000)

it('收藏按顾客隔离、幂等写入、分页前过滤，取消后同步移除', async () => {
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { shopApi } = await import('../api/shop.api')
  const { reset } = await import('../mock/favorites')
  reset()
  auth.token = 'wx-demo-session-category-a'
  expect(await shopApi.favorites()).toEqual([])
  for (const id of [1, 100, 101, 102, 110, 111, 112])
    await shopApi.setFavorite(id, true)
  await shopApi.setFavorite(1, true)
  expect(await shopApi.favorites()).toHaveLength(7)
  expect(await shopApi.fetchShops({ category: 'favorites', page: 2, pageSize: 6 })).toHaveLength(1)
  auth.token = 'wx-demo-session-category-b'
  expect(await shopApi.favorites()).toEqual([])
  expect(await shopApi.fetchShops({ category: 'favorites', page: 1, pageSize: 6 })).toEqual([])
  auth.token = 'wx-demo-session-category-a'
  await shopApi.setFavorite(1, false)
  expect(await shopApi.fetchShops({ category: 'favorites', page: 1, pageSize: 6 })).toHaveLength(6)
  expect(await shopApi.favorites()).not.toContain(1)
  reset()
  expect(await shopApi.favorites()).toEqual([])
  auth.token = ''
  await expect(shopApi.favorites()).rejects.toThrow('请先登录')
}, 30000)
