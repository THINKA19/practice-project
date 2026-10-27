import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useBillPayPayment } from '../composables/use-payment'

const mocks = vi.hoisted(() => ({ session: { hasLogin: true, identity: 'customer', sessionRevision: 1, updateNowTime: vi.fn() }, pay: vi.fn(), demo: true, login: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), redirectToLogin: mocks.login }))
vi.mock('../composables/use-requests', () => ({ isBillDemo: () => mocks.demo, billApi: { pay: mocks.pay } }))
beforeEach(() => {
  mocks.demo = true
  mocks.session.hasLogin = true
  mocks.session.sessionRevision = 1
  mocks.pay.mockReset()
})
it('确认快照与输入独立，重复提交及关闭受锁保护', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useBillPayPayment(() => ({ id: 1, consume: 50, discounts: 5 })))!
  vm.amount.value = '50'
  vm.bindSave()
  expect(vm.money.value).toBe('45.00')
  vm.amount.value = '999'
  let finish!: (value: { payableCents: number }) => void
  mocks.pay.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const pending = vm.paymentOk()
  await vm.paymentOk()
  vm.paymentCancel()
  expect(vm.paymentShow.value).toBe(true)
  expect(mocks.pay).toHaveBeenCalledTimes(1)
  expect(mocks.pay.mock.calls[0][0]).toBe(5000)
  finish({ payableCents: 4500 })
  await pending
  expect(vm.paymentShow.value).toBe(false)
  scope.stop()
})
it('关闭演示时不能提交，游客只能引导登录', () => {
  const scope = effectScope()
  const vm = scope.run(() => useBillPayPayment(() => undefined))!
  vm.amount.value = '50'
  mocks.demo = false
  vm.bindSave()
  expect(vm.paymentShow.value).toBe(false)
  mocks.demo = true
  mocks.session.hasLogin = false
  vm.bindSave()
  expect(mocks.login).toHaveBeenCalledWith({ identity: 'customer' })
  expect(mocks.pay).not.toHaveBeenCalled()
  scope.stop()
})
it('失败重试保持幂等键，换号忽略旧结果', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useBillPayPayment(() => undefined))!
  vm.amount.value = '50'
  vm.bindSave()
  mocks.pay.mockRejectedValueOnce(new Error('network'))
  await vm.paymentOk()
  expect(vm.paymentShow.value).toBe(true)
  let finish!: (value: { payableCents: number }) => void
  mocks.pay.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const pending = vm.paymentOk()
  expect(mocks.pay.mock.calls[0][1]).toBe(mocks.pay.mock.calls[1][1])
  const session = reactive(mocks.session)
  session.sessionRevision++
  finish({ payableCents: 5000 })
  await pending
  expect(vm.amount.value).toBe('')
  scope.stop()
})

it('优惠未就绪不能买单，结果金额不一致不能展示完成', async () => {
  let ready = false
  const scope = effectScope()
  const vm = scope.run(() => useBillPayPayment(() => undefined, () => ready))!
  vm.amount.value = '50'
  vm.bindSave()
  expect(vm.paymentShow.value).toBe(false)
  ready = true
  vm.bindSave()
  mocks.pay.mockResolvedValueOnce({ payableCents: 4900 })
  await vm.paymentOk()
  expect(vm.paymentShow.value).toBe(true)
  expect(vm.amount.value).toBe('50')
  scope.stop()
})

it('失败后关闭并重新确认同一金额沿用请求号', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useBillPayPayment(() => undefined))!
  vm.amount.value = '50'
  vm.bindSave()
  mocks.pay.mockRejectedValue(new Error('timeout'))
  await vm.paymentOk()
  vm.paymentCancel()
  vm.bindSave()
  await vm.paymentOk()
  expect(mocks.pay.mock.calls[0][1]).toBe(mocks.pay.mock.calls[1][1])
  scope.stop()
})

it('结果未确认时阻止改金额创建新单，原金额仍沿用请求号', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useBillPayPayment(() => undefined))!
  vm.amount.value = '50'
  vm.bindSave()
  mocks.pay.mockRejectedValue(new Error('timeout'))
  await vm.paymentOk()
  vm.paymentCancel()
  vm.amount.value = '100'
  vm.bindSave()
  expect(vm.paymentShow.value).toBe(false)
  vm.amount.value = '50'
  vm.bindSave()
  await vm.paymentOk()
  expect(mocks.pay.mock.calls[0][1]).toBe(mocks.pay.mock.calls[1][1])
  scope.stop()
})

it('换号时清除上一账号的金额和确认单草稿', () => {
  const scope = effectScope()
  const vm = scope.run(() => useBillPayPayment(() => undefined))!
  try {
    vm.amount.value = '50'
    vm.bindSave()
    expect(vm.remark.value).toContain('50.00')
    reactive(mocks.session).sessionRevision++
    expect(vm.amount.value).toBe('')
    expect(vm.money.value).toBe('0.00')
    expect(vm.remark.value).toBe('')
    expect(vm.paymentShow.value).toBe(false)
  }
  finally { scope.stop() }
})
