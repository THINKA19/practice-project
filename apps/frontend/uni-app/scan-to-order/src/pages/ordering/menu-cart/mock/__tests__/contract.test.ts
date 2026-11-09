import { afterEach, expect, it, vi } from 'vitest'
import { createCartState } from '../state'

vi.mock('@/pages/auth/session', async original => ({ ...await original<typeof import('@/pages/auth/session')>(), getAuthorizationHeaders: () => ({ Authorization: 'Bearer wx-demo-session-ordering' }) }))

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('按身份和类型隔离，返回快照与重置不会泄漏购物车修改', () => {
  const state = createCartState()
  const rows = state.snapshot('A').items
  rows[0].number = 3
  const saved = state.save('A', '', rows)
  expect(saved.price).toBe(84)
  saved.items[0].number = 99
  expect(state.snapshot('A').number).toBe(3)
  expect(state.snapshot('B').number).toBe(2)
  expect(state.snapshot('A', 'table').number).toBe(2)
  state.reset()
  expect(state.snapshot('A').number).toBe(2)
})

it('通过真实请求入口覆盖规格加料、数量校验、库存、清空与全局重置', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { cartApi } = await import('../../api/cart.api')
  const { toAddCartRequest } = await import('../../models/mappers')
  const { resetAllMocks } = await import('@/mock')
  resetAllMocks()
  await cartApi.empty()
  expect((await cartApi.info())?.items).toEqual([])
  await expect(cartApi.add(toAddCartRequest({ goodsId: 102, number: 1 }))).rejects.toThrow('请选择规格')
  const updated = await cartApi.add(toAddCartRequest({ goodsId: 102, number: 2, sku: [{ optionId: 1, optionValueId: 12 }], addition: [{ pid: 1, id: 1 }] }))
  expect(updated.price).toBe(34)
  expect(updated.items[0].sku?.[0].optionValueName).toBe('大杯')
  const key = updated.items[0].key
  await expect(cartApi.modifyNumber(key, -1)).rejects.toThrow('数量无效')
  await expect(cartApi.modifyNumber(key, 81)).rejects.toThrow('库存不足')
  expect((await cartApi.modifyNumber(key, 3)).price).toBe(51)
  expect((await cartApi.remove(key))?.items).toEqual([])
  const { catalogApi } = await import('../../../menu/api/catalog.api')
  const detail = await catalogApi.goodsDetail(104)
  expect(detail.properties?.map(group => group.name)).toEqual(['份量', '辣度', '米饭'])
  expect(await catalogApi.timesSchedule(104)).toEqual([])
  const sku = [{ optionId: 2, optionValueId: 22 }, { optionId: 3, optionValueId: 32 }, { optionId: 4, optionValueId: 42 }]
  await expect(cartApi.add(toAddCartRequest({ goodsId: 104, number: 1, sku: sku.slice(0, 2) }))).rejects.toThrow('请选择规格')
  await expect(cartApi.add(toAddCartRequest({ goodsId: 104, number: 1, sku: [sku[0], sku[0], sku[2]] }))).rejects.toThrow('无效规格')
  const meal = await cartApi.add(toAddCartRequest({ goodsId: 104, number: 1, sku }))
  expect(meal.items[0].sku?.map(option => option.optionValueName)).toEqual(['大份', '微辣', '少饭'])
  expect((await catalogApi.goodsPrice(104, ',2:22,3:32,4:42')).price).toBe(meal.items[0].price)
  resetAllMocks()
  expect((await cartApi.info())?.number).toBe(2)
  expect(uni.request).not.toHaveBeenCalled()
}, 20000)
