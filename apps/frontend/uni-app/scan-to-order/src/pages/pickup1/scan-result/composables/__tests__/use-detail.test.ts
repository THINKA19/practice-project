import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useScanResultDetail } from '../use-detail'

const session = vi.hoisted(() => ({ hasLogin: true, identity: 'shop', sessionRevision: 1, updateNowTime() {} }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => session }))
const api = vi.hoisted(() => ({ detail: vi.fn(), verify: vi.fn(), demoDetail: vi.fn(), demoVerify: vi.fn() }))
vi.mock('../../../scan/api/orders.api', () => ({ scanApi: api }))
vi.mock('@/utils/project/feedback', () => ({ toast: vi.fn() }))
vi.mock('@/locale', () => ({ t: (key: string) => key }))
const detail = { orderInfo: { status: 1 }, goods: [], goodsCoupons: null, logistics: null }
beforeEach(() => {
  vi.resetAllMocks()
  session.hasLogin = true
  session.identity = 'shop'
  session.sessionRevision = 1
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
})
afterEach(() => vi.unstubAllEnvs())

it('keeps customer simulation separate from staff verification', async () => {
  session.identity = 'customer'
  api.demoDetail.mockResolvedValue(detail)
  api.demoVerify.mockResolvedValue(undefined)
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A', demo: '1' })
  await state.fetchOrderDetail()
  expect(state.canHx.value).toBe(true)
  await state.doneHx()
  expect(api.demoVerify).toHaveBeenCalledWith('A')
  expect(api.verify).not.toHaveBeenCalled()
  state.init({ hxNumber: 'A' })
  await state.fetchOrderDetail()
  expect(state.permissionDenied.value).toBe(true)
  expect(state.canHx.value).toBe(false)
  scope.stop()
})

it('does not allow demo mode in production', async () => {
  vi.stubEnv('DEV', false)
  session.identity = 'customer'
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A', demo: '1' })
  await state.fetchOrderDetail()
  expect(state.demo.value).toBe(false)
  expect(state.permissionDenied.value).toBe(true)
  expect(api.demoDetail).not.toHaveBeenCalled()
  scope.stop()
})

it('blocks duplicate submissions and keeps failure retryable', async () => {
  let reject!: (reason: Error) => void
  api.detail.mockResolvedValue(detail)
  api.verify.mockReturnValue(new Promise((_resolve, fail) => {
    reject = fail
  }))
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A' })
  await state.fetchOrderDetail()
  const pending = state.doneHx()
  await state.doneHx()
  expect(api.verify).toHaveBeenCalledTimes(1)
  reject(new Error('offline'))
  await pending
  expect(state.verified.value).toBe(false)
  expect(state.canHx.value).toBe(true)
  scope.stop()
})

it('ignores details from a previous identity', async () => {
  let resolve!: (value: typeof detail) => void
  api.detail.mockReturnValue(new Promise((done) => {
    resolve = done
  }))
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A' })
  const pending = state.fetchOrderDetail()
  session.sessionRevision++
  resolve(detail)
  await pending
  expect(state.orderDetail.value).toBeNull()
  scope.stop()
})
it('blocks repeat verification when verification succeeded but refresh failed', async () => {
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A' })
  api.detail.mockResolvedValueOnce(detail).mockRejectedValueOnce(new Error('offline'))
  api.verify.mockResolvedValue(undefined)
  await state.fetchOrderDetail()
  await state.doneHx()
  expect(state.verified.value).toBe(true)
  expect(state.orderDetail.value).toEqual(detail)
  expect(state.canHx.value).toBe(false)
  await state.doneHx()
  expect(api.verify).toHaveBeenCalledTimes(1)
  scope.stop()
})
it('ignores old details after changing the verification code', async () => {
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  let resolve!: (value: typeof detail) => void
  api.detail.mockReturnValue(new Promise((r) => {
    resolve = r
  }))
  state.init({ hxNumber: 'A' })
  const pending = state.fetchOrderDetail()
  state.init({ hxNumber: 'B' })
  resolve(detail)
  await pending
  expect(state.orderDetail.value).toBeNull()
  expect(state.canHx.value).toBe(false)
  scope.stop()
})

it('does not submit after leaving the page', async () => {
  api.detail.mockResolvedValue(detail)
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A' })
  await state.fetchOrderDetail()
  scope.stop()
  await state.doneHx()
  expect(api.verify).not.toHaveBeenCalled()
})

it('does not allow verification of an order still in preparation', async () => {
  api.detail.mockResolvedValue({ ...detail, orderInfo: { status: 1, fulfillment: 'preparing' } })
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A' })
  await state.fetchOrderDetail()
  await state.doneHx()
  expect(state.canHx.value).toBe(false)
  expect(api.verify).not.toHaveBeenCalled()
  scope.stop()
})

it('does not invalidate verification when the page refreshes during submission', async () => {
  let finish!: () => void
  api.detail.mockResolvedValue(detail)
  api.verify.mockReturnValue(new Promise<void>((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A' })
  await state.fetchOrderDetail()
  const pending = state.doneHx()
  await state.fetchOrderDetail()
  expect(api.detail).toHaveBeenCalledTimes(1)
  finish()
  await pending
  expect(state.verified.value).toBe(true)
  expect(api.detail).toHaveBeenCalledTimes(2)
  scope.stop()
})

it.each([0, -1, 3, 4])('does not verify an ineligible order with status %s', async (status) => {
  api.detail.mockResolvedValue({ ...detail, orderInfo: { status } })
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  state.init({ hxNumber: 'A' })
  await state.fetchOrderDetail()
  await state.doneHx()
  expect(state.canHx.value).toBe(false)
  expect(api.verify).not.toHaveBeenCalled()
  scope.stop()
})

it('重新查询相同核销码后，旧提交不能解除新提交的锁', async () => {
  api.detail.mockResolvedValue(detail)
  let first!: () => void
  let second!: () => void
  api.verify.mockReturnValueOnce(new Promise<void>((resolve) => {
    first = resolve
  }))
    .mockReturnValueOnce(new Promise<void>((resolve) => {
      second = resolve
    }))
  const scope = effectScope()
  const state = scope.run(useScanResultDetail)!
  try {
    state.init({ hxNumber: 'A' })
    await state.fetchOrderDetail()
    const old = state.doneHx()
    state.init({ hxNumber: 'A' })
    await state.fetchOrderDetail()
    const current = state.doneHx()
    first()
    await old
    expect(state.submitting.value).toBe(true)
    await state.doneHx()
    expect(api.verify).toHaveBeenCalledTimes(2)
    second()
    await current
    expect(state.submitting.value).toBe(false)
  }
  finally { scope.stop() }
})
