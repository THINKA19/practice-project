import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useRiderTaskStore } from '../composables/use-store'
import { formatRiderTime } from '../domain/task.rules'
import { useRiderTaskOrders } from '../composables/use-orders'
import type { RiderOrder } from '../models/types'

vi.mock('@dcloudio/uni-app', () => ({ onLoad: vi.fn(), onShow: vi.fn(), onHide: vi.fn(), onUnload: vi.fn() }))
vi.mock('../composables/use-refresh', () => ({ useRiderTaskRefresh: vi.fn() }))
vi.mock('../api/tasks.api', () => ({ fetchRiderTasks: vi.fn(), setRiderOnline: vi.fn(), submitRiderAction: vi.fn() }))
it('历史订单只包含本人终态任务', () => {
  const pool = useRiderTaskStore()
  pool.riderId = 'R1'
  pool.clock = Date.parse('2026-11-12T17:05:00Z')
  const today = '2026-11-12T17:00:00Z'
  const yesterday = '2026-11-12T16:59:00Z'
  pool.orders = (['assigned', 'accepted', 'delivering', 'done', 'cancelled'] as const).map((status, i) => ({
    id: String(i),
    riderId: 'R1',
    status,
    deliveredAt: today,
    cancelledAt: today,
    deliveryFee: 24_000,
  } as RiderOrder))
  pool.orders.push(
    { id: 'other', riderId: 'R2', status: 'done', deliveredAt: today, deliveryFee: 999 } as RiderOrder,
    { id: 'yesterday', riderId: 'R1', status: 'done', settledAt: yesterday, deliveryFee: 12_000 } as RiderOrder,
    { id: 'undated', riderId: 'R1', status: 'cancelled' } as RiderOrder,
  )
  const scope = effectScope()
  const page = scope.run(useRiderTaskOrders)!
  expect(page.list.value.map(o => o.status)).toEqual(['done', 'cancelled'])
  expect(page.summary.value).toMatchObject({ todayDone: 1, todayIncome: 24_000 })
  expect(page.cancelledCount.value).toBe(1)
  expect(pool.stats.todayCancelled).toBe(1)
  expect(formatRiderTime(today)).toBe('2026-11-13 00:00')
  page.period.value = 'week'
  expect(page.list.value.map(o => o.id)).toEqual(['3', '4', 'yesterday'])
  expect(page.summary.value).toMatchObject({ todayDone: 2, todayIncome: 36_000 })
  page.recordView.value = 'cancelled'
  expect(page.list.value.map(o => o.id)).toEqual(['4'])
  expect(page.summary.value).toMatchObject({ todayDone: 2, todayIncome: 36_000 })
  page.recordView.value = 'done'
  expect(page.list.value.map(o => o.id)).toEqual(['3', 'yesterday'])
  page.recordView.value = 'all'
  page.period.value = 'all'
  expect(page.list.value.map(o => o.id)).toEqual(['3', '4', 'yesterday', 'undated'])
  expect(page.cancelledCount.value).toBe(2)
  expect(page.summary.value).toMatchObject({ todayDone: 2, todayIncome: 36_000 })
  page.orderQuery.value = '#Yesterday'
  expect(page.list.value.map(o => o.id)).toEqual(['yesterday'])
  expect(page.summary.value.todayDone).toBe(2)
  scope.stop()
})
