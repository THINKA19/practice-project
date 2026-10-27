import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useOrderDetailData } from '../use-data'

const state = vi.hoisted(() => ({ preview: vi.fn(), demoPay: vi.fn(), shop: vi.fn(), list: vi.fn() }))
vi.mock('@/pages/pickup/shared', () => ({ pickupApi: { list: state.list } }))
vi.mock('../../api/orders.api', () => ({ orderDetailApi: { preview: state.preview, demoPay: state.demoPay, shop: state.shop } }))
vi.mock('@/utils/project/feedback', () => ({ toast: vi.fn() }))
vi.mock('@/locale', () => ({ t: (key: string) => key }))
beforeEach(() => vi.resetAllMocks())
it('keeps pickup one independent from customer orders and restores preview scenes', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderDetailData)!
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
  const vm = scope.run(useOrderDetailData)!
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
  const vm = scope.run(useOrderDetailData)!
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

it('keeps order details when only the store request fails', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderDetailData)!
  state.preview.mockResolvedValue({ orderInfo: { id: '201', status: 1, shopIdZt: 1 } })
  state.shop.mockRejectedValue(new Error('offline'))
  await vm.fetchOrderDetail()
  expect(vm.failed.value).toBe(false)
  expect(vm.orderDetail.value?.orderInfo.id).toBe('201')
  expect(vm.shopSubdetail.value).toBeNull()
  scope.stop()
})

it('treats an absent preview as empty', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderDetailData)!
  state.preview.mockResolvedValue(null)
  await vm.fetchOrderDetail()
  expect(vm.failed.value).toBe(false)
  expect(vm.orderDetail.value).toBeNull()
  scope.stop()
})
