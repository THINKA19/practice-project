import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => {
  vi.unstubAllEnvs()
})
it('uses an independent detail demo and supports all preview states and simulated payment', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { orderDetailApi } = await import('../../index')
  const { pickupApi } = await import('@/pages/pickup/shared')
  const preview = await orderDetailApi.preview('pickup')
  expect(preview.orderInfo.id).toBe('201')
  expect((await pickupApi.list()).orderList.some(order => order.id === preview.orderInfo.id)).toBe(false)
  expect((await orderDetailApi.preview('delivery')).logistics).not.toBeNull()
  expect((await orderDetailApi.preview('unpaid')).orderInfo.status).toBe(0)
  expect((await orderDetailApi.preview('finished')).orderInfo.status).toBe(3)
  expect((await orderDetailApi.demoPay()).orderInfo.status).toBe(1)
  expect(uni.request).not.toHaveBeenCalled()
}, 15000)

beforeEach(() => resetAllMocks())
