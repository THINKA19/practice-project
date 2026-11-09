import dayjs from 'dayjs'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { resetAllMocks } from '@/mock'

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('discovers the relocated booking entry through the real Alova request chain', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { bookingApi } = await import('../../composables/use-requests')
  const booking = await bookingApi.info(1)
  const { shops } = await import('@/pages/ordering/index/mock')
  expect(booking).toMatchObject({ id: 'table-reservation-1', shopName: shops.find(shop => shop.id === 1)?.name })
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  expect(booking.slots.filter(slot => slot.startsWith(tomorrow))).toEqual(
    ['10', '12', '14', '16', '18', '20', '22'].map(hour => `${tomorrow} ${hour}:00`),
  )
  expect(await bookingApi.join({ shopId: 1, yuyueId: 'table-reservation-1', requestId: 'test-booking-1', extJsonStr: JSON.stringify({ 姓名: '测试', 联系电话: '13800000000', 到店时间: booking.slots[0] }) })).toEqual({ accepted: true })
  expect(uni.request).not.toHaveBeenCalled()
})

beforeEach(() => resetAllMocks())
