import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useAssetPage } from '../composables/use-page'

const mocks = vi.hoisted(() => ({
  session: { sessionRevision: 0, identity: 'customer', updateNowTime: vi.fn() },
  api: { amount: vi.fn(), rechargeRules: vi.fn(), recharge: vi.fn() },
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), requireIdentity: () => true }))
vi.mock('../../asset/composables/use-requests', () => ({ assetApi: mocks.api }))
vi.mock('../../asset/composables/use-context', () => ({ isAssetDemo: () => true }))
beforeEach(() => {
  mocks.session.sessionRevision = 0
  Object.values(mocks.api).forEach(fn => fn.mockReset())
  mocks.api.amount.mockResolvedValue({ balance: 128.5, freeze: 0, score: 260 })
  mocks.api.rechargeRules.mockResolvedValue([{ id: 1, confine: 100, send: 15 }])
})
it('返回钱包时后台刷新保留内容，失败和重试不恢复首次加载状态', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useAssetPage())!
  try {
    expect(vm.loaded.value).toBe(false)
    const first = vm.refresh()
    expect(vm.loading.value).toBe(true)
    await first
    expect(vm.loaded.value).toBe(true)
    let complete!: (value: { balance: number, freeze: number, score: number }) => void
    mocks.api.amount.mockImplementationOnce(() => new Promise((resolve) => {
      complete = resolve
    }))
    const background = vm.refresh()
    expect(vm.loading.value).toBe(true)
    expect(vm.loaded.value).toBe(true)
    expect(vm.balance.value).toBe('128.50')
    expect(vm.rechargeSendRules.value).toHaveLength(1)
    complete({ balance: 130, freeze: 0, score: 260 })
    await background
    mocks.api.amount.mockRejectedValueOnce(new Error('offline'))
    await vm.refresh()
    expect(vm.failed.value).toBe(true)
    expect(vm.loaded.value).toBe(true)
    expect(vm.balance.value).toBe('130.00')
    await vm.refresh()
    expect(vm.failed.value).toBe(false)
    reactive(mocks.session).sessionRevision++
    expect(vm.loaded.value).toBe(false)
    expect(vm.balance.value).toBe('—')
  }
  finally { scope.stop() }
})

it('刷新套餐顺序变化时保留所选套餐，套餐删除后安全回退', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useAssetPage())!
  const first = { id: 1, confine: 100, send: 15 }
  const second = { id: 2, confine: 200, send: 40 }
  try {
    mocks.api.rechargeRules.mockResolvedValueOnce([first, second])
    await vm.refresh()
    vm.changePersionNum(1)
    mocks.api.rechargeRules.mockResolvedValueOnce([second, first])
    await vm.refresh()
    expect(vm.ruleSelIndex.value).toBe(0)
    vm.submit1()
    expect(vm.money.value).toBe(200)
    mocks.api.rechargeRules.mockResolvedValueOnce([])
    await vm.refresh()
    expect(vm.ruleSelIndex.value).toBe(-1)
  }
  finally { scope.stop() }
})

it('合并刷新、校验自定义金额，充值由响应确认，连续确认仅提交一次', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useAssetPage())!
  let complete!: (value: { balance: number, freeze: number, score: number }) => void
  mocks.api.recharge.mockImplementation(() => new Promise((resolve) => {
    complete = resolve
  }))
  try {
    await Promise.all([vm.refresh(), vm.refresh()])
    expect(mocks.api.amount).toHaveBeenCalledOnce()
    expect(vm.balance.value).toBe('128.50')
    vm.amount2.value = '1.001'
    vm.submit2()
    expect(vm.paymentShow.value).toBe(false)
    vm.submit1()
    const payment = vm.paymentOk()
    await vm.paymentOk()
    expect(mocks.api.recharge).toHaveBeenCalledOnce()
    expect(vm.balance.value).toBe('128.50')
    expect(vm.paying.value).toBe(true)
    complete({ balance: 243.5, freeze: 0, score: 260 })
    await payment
    expect(vm.balance.value).toBe('243.50')
    expect(vm.paymentShow.value).toBe(false)
    expect(vm.paying.value).toBe(false)
  }
  finally { scope.stop() }
})
it('充值失败保留金额和幂等标识以供重试；换账户后丢弃迟到结果', async () => {
  mocks.api.recharge.mockRejectedValueOnce(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(() => useAssetPage())!
  try {
    await vm.refresh()
    vm.submit1()
    await vm.paymentOk()
    expect(vm.balance.value).toBe('128.50')
    expect(vm.paymentShow.value).toBe(true)
    const requestId = mocks.api.recharge.mock.calls[0]?.[1]
    let complete!: (value: { balance: number, freeze: number, score: number }) => void
    mocks.api.recharge.mockImplementation(() => new Promise((resolve) => {
      complete = resolve
    }))
    const retry = vm.paymentOk()
    expect(mocks.api.recharge).toHaveBeenLastCalledWith(100, requestId)
    reactive(mocks.session).sessionRevision++
    complete({ balance: 243.5, freeze: 0, score: 260 })
    await retry
    expect(vm.balance.value).toBe('—')
    expect(vm.paymentShow.value).toBe(false)
  }
  finally { scope.stop() }
})

it('充值前发起的余额读取不能覆盖充值成功后的新余额', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useAssetPage())!
  let complete!: (value: { balance: number, freeze: number, score: number }) => void
  try {
    await vm.refresh()
    mocks.api.amount.mockImplementation(() => new Promise((resolve) => {
      complete = resolve
    }))
    const stale = vm.refresh()
    vm.amount2.value = '100'
    vm.submit2()
    mocks.api.recharge.mockResolvedValue({ balance: 243.5, freeze: 0, score: 260 })
    await vm.paymentOk()
    complete({ balance: 128.5, freeze: 0, score: 260 })
    await stale
    expect(vm.balance.value).toBe('243.50')
  }
  finally { scope.stop() }
})

it('换账户重置套餐选择和失败状态，支付期间不能改写提交金额', async () => {
  const scope = effectScope()
  const vm = scope.run(() => useAssetPage())!
  try {
    await vm.refresh()
    vm.submit1()
    let complete!: (value: { balance: number, freeze: number, score: number }) => void
    mocks.api.recharge.mockImplementation(() => new Promise((resolve) => {
      complete = resolve
    }))
    const payment = vm.paymentOk()
    vm.amount2.value = '200'
    vm.submit2()
    expect(vm.money.value).toBe(100)
    complete({ balance: 243.5, freeze: 0, score: 260 })
    await payment
    vm.changePersionNum(-1)
    mocks.api.amount.mockRejectedValueOnce(new Error('offline'))
    await vm.refresh()
    expect(vm.failed.value).toBe(true)
    reactive(mocks.session).sessionRevision++
    expect(vm.failed.value).toBe(false)
    expect(vm.ruleSelIndex.value).toBe(0)
    expect(vm.amount2.value).toBe('')
  }
  finally { scope.stop() }
})
