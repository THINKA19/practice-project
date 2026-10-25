import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('discovers the relocated booking entry through the real Alova request chain', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { bookingApi } = await import('../../api/booking')
  expect(await bookingApi.info()).toEqual({ id: 'table-reservation' })
  expect(await bookingApi.join({ yuyueId: 'table-reservation', extJsonStr: JSON.stringify({ 姓名: '测试', 联系电话: '13800000000', 到店时间: '12:00' }) })).toEqual({ accepted: true })
  expect(uni.request).not.toHaveBeenCalled()
})

beforeEach(() => resetAllMocks())
