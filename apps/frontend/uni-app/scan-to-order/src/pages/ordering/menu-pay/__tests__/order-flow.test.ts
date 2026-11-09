/** 支付编排行为回归：验证真实业务边界，外部领域只替换其公开接口。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { usePayOrder } from '../composables/use-order'

const m = vi.hoisted(() => ({ amount: vi.fn(), pay: vi.fn(), confirm: vi.fn(), allowed: true, revision: 1, resets: [] as Array<() => void> }))
vi.mock('@/pages/auth/session', () => ({ getSessionRevision: () => 0, requireIdentity: () => m.allowed, useSessionAccountScope: (reset: () => void) => {
  m.resets.push(reset)
  return { ticket: () => m.revision, current: (ticket: number) => ticket === m.revision }
} }))
vi.mock('@/pages/account/assets/asset', () => ({ assetApi: { amount: m.amount } }))
vi.mock('@/pages/account/profile/order', () => ({ orderApi: { payByBalance: m.pay } }))
vi.mock('@/utils/project/interaction', () => ({ confirm: m.confirm }))
const scopes: ReturnType<typeof effectScope>[] = []
function create() {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(() => usePayOrder())!
}
beforeEach(() => {
  vi.clearAllMocks()
  m.allowed = true
  m.revision = 1
  m.resets = []
  m.amount.mockResolvedValue({ balance: 100, score: 100 })
  m.confirm.mockResolvedValue(true)
  m.pay.mockResolvedValue(null)
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
})
it('游客与异常金额在请求钱包之前被拦截', async () => {
  const vm = create()
  m.allowed = false
  expect(await vm.settle({ id: 1, amountReal: 28 })).toEqual({ kind: 'cancelled' })
  m.allowed = true
  await expect(vm.settle({ id: 1, amountReal: Number.NaN })).rejects.toThrow('金额')
  await expect(vm.settle({ id: 1, amountReal: -1 })).rejects.toThrow('金额')
  expect(m.amount).not.toHaveBeenCalled()
  expect(m.pay).not.toHaveBeenCalled()
})
it('余额不足只打开待支付订单收银台，不声称支付成功', async () => {
  m.amount.mockResolvedValue({ balance: 10, score: 100 })
  const vm = create()
  expect(await vm.settle({ id: 12, amountReal: 28 })).toEqual({ kind: 'panelOpened' })
  expect(vm.money.value).toBe(18)
  expect(vm.nextAction.value).toEqual({ type: 0, id: 12 })
  expect(vm.show.value).toBe(true)
  expect(m.pay).not.toHaveBeenCalled()
})
it('用户取消确认不会扣余额，服务端失败不返回已支付', async () => {
  const vm = create()
  m.confirm.mockResolvedValueOnce(false)
  expect(await vm.settle({ id: 12, amountReal: 28 })).toEqual({ kind: 'cancelled' })
  expect(m.pay).not.toHaveBeenCalled()
  m.pay.mockRejectedValueOnce(new Error('余额支付失败'))
  await expect(vm.settle({ id: 12, amountReal: 28 })).rejects.toThrow('余额支付失败')
  expect(vm.settling.value).toBe(false)
})
it('换账号后的旧余额响应不得打开收银台或触发支付', async () => {
  let resolve!: (value: { balance: number, score: number }) => void
  m.amount.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const vm = create()
  const pending = vm.settle({ id: 12, amountReal: 28 })
  m.revision++
  m.resets.forEach(reset => reset())
  resolve({ balance: 100, score: 100 })
  expect(await pending).toEqual({ kind: 'obsolete' })
  expect(vm.show.value).toBe(false)
  expect(m.pay).not.toHaveBeenCalled()
})
it('连续点击只发起一次支付，关闭后旧响应不再生效', async () => {
  let resolve!: (value: { balance: number, score: number }) => void
  m.amount.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const vm = create()
  const first = vm.settle({ id: 12, amountReal: 28 })
  expect(await vm.settle({ id: 12, amountReal: 28 })).toEqual({ kind: 'busy' })
  vm.close()
  resolve({ balance: 0, score: 100 })
  expect(await first).toEqual({ kind: 'obsolete' })
  expect(vm.nextAction.value).toBeUndefined()
  expect(m.amount).toHaveBeenCalledTimes(1)
})
