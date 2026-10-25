import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useOrderDetail } from '../useOrderDetail'

const state = vi.hoisted(() => ({ preview: vi.fn(), demoPay: vi.fn(), list: vi.fn() }))
vi.mock('@/pages/pickup/index', () => ({ pickupApi: { list: state.list } }))
vi.mock('../../api/orders', () => ({ orderDetailApi: { preview: state.preview, demoPay: state.demoPay } }))
vi.mock('@/utils/project/feedback', () => ({ toast: vi.fn() }))
vi.mock('@/locale', () => ({ t: (key: string) => key }))
beforeEach(() => vi.resetAllMocks())
it('keeps pickup one independent from customer orders and restores preview scenes', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderDetail)!
  state.preview.mockImplementation(scene => Promise.resolve({ orderInfo: { id: '201', status: scene === 'unpaid' ? 0 : 1 } }))
  await vm.fetchOrderDetail()
  expect(state.preview).toHaveBeenCalledWith('pickup')
  await vm.selectScene('delivery')
  expect(state.preview).toHaveBeenLastCalledWith('delivery')
  expect(state.list).not.toHaveBeenCalled()
  scope.stop()
})
it('restores the demo payment popup and only updates after mock payment succeeds', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderDetail)!
  state.preview.mockResolvedValue({ orderInfo: { id: '201', status: 0, amountReal: 52 } })
  await vm.selectScene('unpaid')
  vm.toPayTap()
  expect(vm.paymentShow.value).toBe(true)
  state.demoPay.mockRejectedValueOnce(new Error('offline'))
  await vm.paymentConfirm()
  expect(vm.orderDetail.value?.orderInfo.status).toBe(0)
  state.demoPay.mockResolvedValue({ orderInfo: { id: '201', status: 1, amountReal: 52 } })
  vm.toPayTap()
  await vm.paymentConfirm()
  expect(vm.orderDetail.value?.orderInfo.status).toBe(1)
  expect(vm.scene.value).toBe('pickup')
  expect(state.list).not.toHaveBeenCalled()
  scope.stop()
})

it('does not invalidate payment when the page refreshes during submission', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderDetail)!
  state.preview.mockResolvedValue({ orderInfo: { id: '201', status: 0 } })
  await vm.selectScene('unpaid')
  let finish!: (value: unknown) => void
  state.demoPay.mockReturnValue(new Promise((resolve) => {
    finish = resolve
  }))
  const pending = vm.paymentConfirm()
  await vm.fetchOrderDetail()
  expect(state.preview).toHaveBeenCalledTimes(1)
  finish({ orderInfo: { id: '201', status: 1 } })
  await pending
  expect(vm.orderDetail.value?.orderInfo.status).toBe(1)
  expect(vm.scene.value).toBe('pickup')
  scope.stop()
})
