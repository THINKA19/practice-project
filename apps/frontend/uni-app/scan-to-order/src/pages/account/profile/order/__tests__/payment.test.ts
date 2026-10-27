import { beforeEach, expect, it, vi } from 'vitest'
import { useOrderPay } from '../composables/use-pay'

const m = vi.hoisted(() => ({ amount: vi.fn(), pay: vi.fn(), confirm: vi.fn(), error: vi.fn(), toast: vi.fn(), current: true }))
vi.mock('@/pages/auth/session', () => ({ requireIdentity: () => true, useSessionAccountScope: () => ({ ticket: () => 1, current: () => m.current }) }))
vi.mock('@/pages/account/assets/asset', () => ({ assetApi: { amount: m.amount } }))
vi.mock('../composables/use-requests', () => ({ orderApi: { payByBalance: m.pay } }))
vi.mock('@/utils/project/interaction', () => ({ confirm: m.confirm, showError: m.error, toast: m.toast }))
const order = { id: 1, status: 0, amountReal: 20, score: 0 }
beforeEach(() => {
  vi.clearAllMocks()
  m.current = true
  m.amount.mockResolvedValue({ balance: 100, score: 0 })
  m.confirm.mockResolvedValue(true)
  m.pay.mockResolvedValue(null)
})
it('取消等动作进行中时禁止发起支付', async () => {
  await useOrderPay(vi.fn(), () => true).toPay(order)
  expect(m.amount).not.toHaveBeenCalled()
  expect(m.pay).not.toHaveBeenCalled()
})
it('异常金额及异常余额不得进入扣款', async () => {
  const vm = useOrderPay(vi.fn())
  await vm.toPay({ ...order, amountReal: Number.NaN })
  expect(m.amount).not.toHaveBeenCalled()
  m.amount.mockResolvedValue({ balance: Number.NaN, score: 0 })
  await vm.toPay(order)
  expect(m.pay).not.toHaveBeenCalled()
  expect(m.error).toHaveBeenCalledTimes(2)
})
it('确认期间换账户后不提交支付', async () => {
  m.confirm.mockImplementation(async () => {
    m.current = false
    return true
  })
  await useOrderPay(vi.fn()).toPay(order)
  expect(m.pay).not.toHaveBeenCalled()
})
it('支付接口返回后刷新订单，不将受理直接宣称为结算成功', async () => {
  const refresh = vi.fn().mockResolvedValue(undefined)
  await useOrderPay(refresh).toPay(order)
  expect(m.pay).toHaveBeenCalledWith(1)
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(m.toast).not.toHaveBeenCalledWith('支付成功', 'success')
})
