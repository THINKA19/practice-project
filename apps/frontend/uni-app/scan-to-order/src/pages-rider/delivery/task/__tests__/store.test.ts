import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRiderTaskStore } from '../composables/use-store'
import { fetchRiderTasks, setRiderOnline, submitRiderAction } from '../api/tasks.api'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useSessionState } from '@/pages/auth/session'
import type { RiderTaskSnapshot } from '../models/types'
import { createTasks, demoGrant } from '../mock/fixtures'

vi.mock('../api/tasks.api', () => ({ fetchRiderTasks: vi.fn(), setRiderOnline: vi.fn(), submitRiderAction: vi.fn() }))
const permissions = vi.hoisted(() => ({ require: vi.fn() }))
vi.mock('@/pages-rider/auth/permissions', () => ({ useRiderPermissionsStore: () => ({ requirePermission: permissions.require }) }))
const snapshot = (id = '1'): RiderTaskSnapshot => ({ tasks: [{ ...createTasks(demoGrant('30001')!, id)[0], serviceArea: undefined, deliveryFee: 6, id: 'task', riderId: id, status: 'accepted' }], riderId: id, online: true, maxConcurrent: 3 })
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
beforeEach(() => {
  seedSession({}, 'rider')
  permissions.require.mockReset().mockResolvedValue(undefined)
  vi.mocked(fetchRiderTasks).mockReset()
  vi.mocked(submitRiderAction).mockReset()
  vi.mocked(setRiderOnline).mockReset()
})
describe('任务投影并发与会话隔离', () => {
  it('乱序列表仅采用最新响应', async () => {
    const old = deferred<RiderTaskSnapshot>()
    const current = deferred<RiderTaskSnapshot>()
    vi.mocked(fetchRiderTasks).mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const pool = useRiderTaskStore()
    const a = pool.refresh()
    const b = pool.refresh()
    current.resolve(snapshot('2'))
    await b
    old.resolve(snapshot('1'))
    await a
    expect(pool.riderId).toBe('2')
  })
  it('相同 token 重新登录，旧请求不能回填', async () => {
    const request = deferred<RiderTaskSnapshot>()
    vi.mocked(fetchRiderTasks).mockReturnValueOnce(request.promise)
    const pool = useRiderTaskStore()
    const pending = pool.refresh()
    useSessionState().clearSession()
    seedSession({}, 'rider')
    request.resolve(snapshot())
    await pending
    expect(pool.orders).toEqual([])
    expect(pool.loading).toBe(false)
  })
  it('重复点击只提交一次；换号后旧动作不刷新或解除新动作锁', async () => {
    vi.mocked(fetchRiderTasks).mockResolvedValue(snapshot())
    const pool = useRiderTaskStore()
    await pool.refresh()
    const old = deferred<void>()
    vi.mocked(submitRiderAction).mockReturnValueOnce(old.promise)
    const a = pool.pickupOrder(pool.activeOrders[0])
    await pool.pickupOrder(pool.activeOrders[0])
    expect(submitRiderAction).toHaveBeenCalledTimes(1)
    seedSession({ userId: 2 }, 'rider')
    await pool.refresh()
    const newer = deferred<void>()
    vi.mocked(setRiderOnline).mockReturnValueOnce(newer.promise)
    const b = pool.toggleOnline()
    const reads = vi.mocked(fetchRiderTasks).mock.calls.length
    old.resolve()
    await a
    expect(pool.submitting).toBe(true)
    expect(fetchRiderTasks).toHaveBeenCalledTimes(reads)
    newer.resolve()
    await b
    expect(pool.submitting).toBe(false)
  })
  it('失败保留可重试错误，清空身份时重置上限和投影', async () => {
    vi.mocked(fetchRiderTasks).mockRejectedValue(new Error('离线'))
    const pool = useRiderTaskStore()
    expect(await pool.refresh()).toBe(false)
    expect(pool.error).toBe('离线')
    useSessionState().clearSession()
    expect(pool.error).toBe('')
    expect(pool.maxConcurrent).toBe(0)
  })
})

it('权限拒绝不提交配送动作，权限等待期间换号也不提交', async () => {
  vi.mocked(fetchRiderTasks).mockResolvedValue(snapshot())
  const pool = useRiderTaskStore()
  await pool.refresh()
  permissions.require.mockRejectedValueOnce(new Error('无权取餐'))
  const denied = await pool.pickupOrder(pool.activeOrders[0])
  expect(denied.ok).toBe(false)
  expect(submitRiderAction).not.toHaveBeenCalled()
  const grant = deferred<void>()
  permissions.require.mockReturnValueOnce(grant.promise)
  const pending = pool.pickupOrder(pool.activeOrders[0])
  seedSession({ userId: 2 }, 'rider')
  grant.resolve()
  expect((await pending).ok).toBe(false)
  expect(submitRiderAction).not.toHaveBeenCalled()
})
