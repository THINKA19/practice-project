import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
})
it('serves the demo list and removes the matching order after verification', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { doingApi } = await import('../../api/orders')
  const { scanApi } = await import('@/pages/pickup1/scan-result')
  const before = await doingApi.preview()
  expect(before.orderList).toHaveLength(3)
  const preparingBefore = await doingApi.preview('preparing')
  const order = before.orderList[0]
  expect((await scanApi.demoDetail(order.hxNumber)).orderInfo.status).toBe(1)
  await scanApi.demoVerify(order.hxNumber)
  expect((await scanApi.demoDetail(order.hxNumber)).orderInfo.status).toBe(3)
  await expect(scanApi.demoVerify(order.hxNumber)).rejects.toThrow()
  await expect(scanApi.demoDetail('invalid')).rejects.toThrow()
  expect((await scanApi.detail(order.hxNumber)).orderInfo.status).toBe(1)
  expect((await doingApi.preview()).orderList.some(item => item.id === order.id)).toBe(false)
  expect((await doingApi.preview('ready')).orderList).toEqual([])
  expect((await doingApi.preview('preparing')).orderList).toEqual(preparingBefore.orderList)
  expect((await doingApi.preview('empty')).orderList).toEqual([])
  const preparingCode = preparingBefore.orderList[0].hxNumber
  await expect(scanApi.demoVerify(preparingCode)).rejects.toThrow()
  expect((await scanApi.demoDetail(preparingCode)).orderInfo.fulfillment).toBe('preparing')
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)

it('serves preparation and empty scenes and reports failures through the request layer', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { doingApi } = await import('../../api/orders')
  const preparing = await doingApi.preview('preparing')
  expect(preparing.orderList).toHaveLength(1)
  expect(preparing.orderList[0].fulfillment).toBe('preparing')
  expect((await doingApi.preview('ready')).orderList[0].fulfillment).toBe('ready')
  expect((await doingApi.preview('empty')).orderList).toEqual([])
  await expect(doingApi.preview('failure')).rejects.toThrow()
})

beforeEach(() => resetAllMocks())
