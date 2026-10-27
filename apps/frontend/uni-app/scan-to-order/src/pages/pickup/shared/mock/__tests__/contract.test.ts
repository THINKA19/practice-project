import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
})
it('list, detail and verification share the same mock backend through Alova', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { pickupApi } = await import('../../api/orders.api')
  const { orderDetailApi } = await import('@/pages/pickup1/index')
  const { scanApi } = await import('@/pages/pickup1/scan')
  const list = await pickupApi.list()
  expect(list.orderList).toHaveLength(2)
  const order = list.orderList[0]
  expect((await orderDetailApi.detail(order.id)).orderInfo.id).toBe(order.id)
  expect((await scanApi.detail(order.hxNumber)).orderInfo.status).toBe(1)
  await scanApi.verify(order.hxNumber)
  expect((await scanApi.detail(order.hxNumber)).orderInfo.status).toBe(3)
  expect((await pickupApi.list()).orderList).toHaveLength(1)
  await expect(scanApi.verify(order.hxNumber)).rejects.toThrow()
  await expect(scanApi.detail('invalid')).rejects.toThrow()
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)

beforeEach(() => resetAllMocks())
