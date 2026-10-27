import { effectScope, reactive } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useMemberCenterAccount } from '../composables/use-account'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: true, identity: 'customer' as string | null, sessionRevision: 1, userInfo: { userId: 7 }, updateNowTime: vi.fn() },
  amount: vi.fn(),
  demo: false,
}))
vi.mock('@/pages/auth/session', () => ({
  useSessionState: () => reactive(mocks.session),
  requireIdentity: vi.fn(),
}))
vi.mock('@/pages/account/assets/asset', () => ({
  assetApi: { amount: mocks.amount },
  isAssetDemo: () => mocks.demo,
}))
beforeEach(() => {
  Object.assign(mocks.session, { hasLogin: true, identity: 'customer', sessionRevision: 1 })
  mocks.demo = false
  mocks.amount.mockReset()
})
afterEach(() => vi.restoreAllMocks())

it('重复刷新合并，缺失累计消费不伪造为零', async () => {
  mocks.amount.mockResolvedValue({ balance: 128.5, score: 260 })
  const scope = effectScope()
  const vm = scope.run(useMemberCenterAccount)!
  try {
    const first = vm.refresh()
    expect(vm.refresh()).toBe(first)
    await first
    expect(mocks.amount).toHaveBeenCalledOnce()
    expect(vm.balance.value).toBe('128.50')
    expect(vm.score.value).toBe(260)
    expect(vm.totalConsumed.value).toBeNull()
  }
  finally { scope.stop() }
})

it('退出后清空资产，旧响应不能写回，新账户可以重新请求', async () => {
  let finish!: (data: unknown) => void
  mocks.amount.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useMemberCenterAccount)!
  try {
    const request = vm.refresh()
    const state = reactive(mocks.session)
    state.hasLogin = false
    state.identity = null
    state.sessionRevision++
    finish({ balance: 999, score: 999 })
    await request
    expect(vm.balance.value).toBe('—')
    expect(vm.user.value).toBeNull()
    state.hasLogin = true
    state.identity = 'customer'
    state.sessionRevision++
    mocks.amount.mockResolvedValue({ balance: 20, score: 3, totleConsumed: 50 })
    await vm.refresh()
    expect(vm.balance.value).toBe('20.00')
    expect(vm.totalConsumed.value).toBe(50)
  }
  finally { scope.stop() }
})

it('游客、其他身份不请求私人资产，开发游客可预览，失败可以重试', async () => {
  const scope = effectScope()
  try {
    const state = reactive(mocks.session)
    state.identity = 'shop'
    const blocked = scope.run(useMemberCenterAccount)!
    await blocked.refresh()
    expect(mocks.amount).not.toHaveBeenCalled()
    state.identity = null
    state.hasLogin = false
    await blocked.refresh()
    expect(mocks.amount).not.toHaveBeenCalled()
    mocks.demo = true
    const preview = scope.run(useMemberCenterAccount)!
    mocks.amount.mockRejectedValueOnce(new Error('network'))
    await preview.refresh()
    expect(preview.failed.value).toBe(true)
    mocks.amount.mockResolvedValue({ balance: 0, score: 0 })
    await preview.refresh()
    expect(preview.failed.value).toBe(false)
    expect(preview.balance.value).toBe('0.00')
  }
  finally { scope.stop() }
})

it('同一账户刷新期间和失败时保留资产，再次成功后更新数字', async () => {
  const scope = effectScope()
  const vm = scope.run(useMemberCenterAccount)!
  try {
    mocks.amount.mockResolvedValueOnce({ balance: 128.5, score: 260 })
    await vm.refresh()
    mocks.amount.mockRejectedValueOnce(new Error('network'))
    const refresh = vm.refresh()
    expect(vm.loading.value).toBe(true)
    expect(vm.balance.value).toBe('128.50')
    expect(vm.score.value).toBe(260)
    await refresh
    expect(vm.failed.value).toBe(true)
    expect(vm.balance.value).toBe('128.50')
    expect(vm.score.value).toBe(260)
    mocks.amount.mockResolvedValueOnce({ balance: 100, score: 300 })
    await vm.refresh()
    expect(vm.balance.value).toBe('100.00')
    expect(vm.score.value).toBe(300)
  }
  finally { scope.stop() }
})

it('页面销毁后的响应不会写回', async () => {
  let finish!: (data: unknown) => void
  mocks.amount.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useMemberCenterAccount)!
  const request = vm.refresh()
  scope.stop()
  finish({ balance: 99, score: 99 })
  await request
  expect(vm.balance.value).toBe('—')
})
