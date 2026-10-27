import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useOrderVerificationDetail } from '../composables/use-detail'

const mocks = vi.hoisted(() => ({ session: { hasLogin: true, identity: 'shop', sessionRevision: 1, updateNowTime: vi.fn() }, detail: vi.fn(), verify: vi.fn(), login: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), redirectToLogin: mocks.login }))
vi.mock('@/pages/pickup1/scan', () => ({ scanApi: { detail: mocks.detail, verify: mocks.verify } }))
const order = { orderInfo: { status: 1, amountReal: 12 }, goods: [] }
beforeEach(() => {
  mocks.login.mockReset()
  mocks.session.hasLogin = true
  mocks.session.identity = 'shop'
  mocks.session.sessionRevision = 1
  mocks.detail.mockReset().mockResolvedValue(order)
  mocks.verify.mockReset().mockResolvedValue({})
})
it('空码不请求，顾客不能查询和核销', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderVerificationDetail)!
  await vm.loadVerify(' ')
  expect(mocks.detail).not.toHaveBeenCalled()
  mocks.session.identity = 'customer'
  await vm.loadVerify('CODE')
  await vm.confirm()
  expect(mocks.detail).not.toHaveBeenCalled()
  expect(mocks.verify).not.toHaveBeenCalled()
  expect(mocks.login).not.toHaveBeenCalled()
  scope.stop()
})
it('核销失败不能显示成功，重复点击只提交一次', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderVerificationDetail)!
  await vm.loadVerify('CODE')
  mocks.verify.mockRejectedValueOnce(new Error('denied'))
  await vm.confirm()
  expect(vm.verified.value).toBe(false)
  await vm.confirm()
  expect(mocks.verify).toHaveBeenCalledTimes(1)
  await vm.loadVerify('CODE')
  let finish!: (value: null) => void
  mocks.verify.mockImplementationOnce(() => new Promise<null>((resolve) => {
    finish = resolve
  }))
  const first = vm.confirm()
  await vm.confirm()
  expect(mocks.verify).toHaveBeenCalledTimes(2)
  finish(null)
  await first
  expect(vm.verified.value).toBe(true)
  scope.stop()
})
it('旧查询及销毁后的响应不写回', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderVerificationDetail)!
  let finish!: (value: typeof order) => void
  mocks.detail.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const old = vm.loadVerify('OLD')
  await vm.loadVerify('NEW')
  finish({ ...order, orderInfo: { status: 3, amountReal: 99 } })
  await old
  expect(vm.code.value).toBe('NEW')
  expect(vm.verified.value).toBe(false)
  mocks.detail.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const last = vm.loadVerify('LAST')
  scope.stop()
  finish(order)
  await last
  expect(vm.detail.value).toBeNull()
})
it('制作中订单不能确认核销，完成订单仅展示结果', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderVerificationDetail)!
  mocks.detail.mockResolvedValueOnce({ ...order, orderInfo: { ...order.orderInfo, fulfillment: 'preparing' } })
  await vm.loadVerify('A')
  await vm.confirm()
  expect(mocks.verify).not.toHaveBeenCalled()
  mocks.detail.mockResolvedValueOnce({ ...order, orderInfo: { ...order.orderInfo, status: 3 } })
  await vm.loadVerify('B')
  expect(vm.verified.value).toBe(true)
  scope.stop()
})

it('游客扫码引导门店登录，已登录顾客扫码不切换会话', () => {
  const scope = effectScope()
  const vm = scope.run(useOrderVerificationDetail)!
  mocks.session.identity = 'customer'
  vm.scan()
  expect(mocks.login).not.toHaveBeenCalled()
  mocks.session.hasLogin = false
  vm.scan()
  expect(mocks.login).toHaveBeenCalledWith({ identity: 'shop' })
  scope.stop()
})
