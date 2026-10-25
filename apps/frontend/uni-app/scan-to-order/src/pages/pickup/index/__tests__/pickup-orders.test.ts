import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { usePickupOrders } from '../composables/usePickupOrders'

const state = vi.hoisted(() => ({ session: { hasLogin: true, identity: 'customer', sessionRevision: 1, updateNowTime: vi.fn() }, list: vi.fn() }))
vi.mock('@/pages/auth/session', async () => ({
  ...await import('@/pages/auth/session/routes'),
  useSession: () => state.session,
}))
vi.mock('../api/orders', () => ({ pickupApi: { list: state.list } }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
beforeEach(() => {
  state.list.mockReset()
  state.session.updateNowTime.mockReset()
  state.session.hasLogin = true
  state.session.sessionRevision = 1
})
it('checks session expiry before requesting orders', async () => {
  state.session.updateNowTime.mockImplementation(() => {
    state.session.hasLogin = false
  })
  const scope = effectScope()
  const vm = scope.run(usePickupOrders)!
  await vm.refresh()
  expect(vm.needsLogin.value).toBe(true)
  expect(state.list).not.toHaveBeenCalled()
  scope.stop()
})
it('clears orders when the customer signs out', async () => {
  const scope = effectScope()
  const vm = scope.run(usePickupOrders)!
  state.list.mockResolvedValue({ orderList: [{ id: '1' }], goodsMap: {}, logisticsMap: {} })
  await vm.refresh()
  expect(vm.orderList.value).toHaveLength(1)
  state.session.hasLogin = false
  await vm.refresh()
  expect(vm.orderList.value).toBeNull()
  expect(state.list).toHaveBeenCalledTimes(1)
  scope.stop()
})
it('ignores a response from the previous session', async () => {
  const scope = effectScope()
  const vm = scope.run(usePickupOrders)!
  let resolve!: (value: unknown) => void
  state.list.mockReturnValue(new Promise((done) => {
    resolve = done
  }))
  const pending = vm.refresh()
  state.session.sessionRevision++
  resolve({ orderList: [{ id: 'old' }], goodsMap: {}, logisticsMap: {} })
  await pending
  expect(vm.orderList.value).toBeNull()
  scope.stop()
})
it('does not accept orders after the page is disposed', async () => {
  const scope = effectScope()
  const vm = scope.run(usePickupOrders)!
  let resolve!: (value: unknown) => void
  state.list.mockReturnValue(new Promise((done) => {
    resolve = done
  }))
  const pending = vm.refresh()
  scope.stop()
  resolve({ orderList: [{ id: 'old' }], goodsMap: {}, logisticsMap: {} })
  await pending
  expect(vm.orderList.value).toBeNull()
  await vm.refresh()
  expect(state.list).toHaveBeenCalledTimes(1)
})

it('can use the explicit demo loader without requesting authenticated customer orders', async () => {
  state.session.hasLogin = false
  state.list.mockResolvedValue({ orderList: [{ id: 'demo' }], goodsMap: {}, logisticsMap: {} })
  const scope = effectScope()
  const vm = scope.run(() => usePickupOrders(state.list, false))!
  await vm.refresh()
  expect(vm.orderList.value?.[0].id).toBe('demo')
  scope.stop()
})

it('distinguishes login, failure, and successful empty responses', async () => {
  const scope = effectScope()
  const vm = scope.run(usePickupOrders)!
  state.session.hasLogin = false
  await vm.refresh()
  expect(vm.needsLogin.value).toBe(true)
  expect(vm.failed.value).toBe(false)
  state.session.hasLogin = true
  state.list.mockRejectedValueOnce(new Error('offline'))
  await vm.refresh()
  expect(vm.needsLogin.value).toBe(false)
  expect(vm.failed.value).toBe(true)
  state.list.mockResolvedValueOnce({ orderList: [], goodsMap: {}, logisticsMap: {} })
  await vm.refresh()
  expect(vm.failed.value).toBe(false)
  expect(vm.loading.value).toBe(false)
  expect(vm.orderList.value).toBeNull()
  scope.stop()
})
