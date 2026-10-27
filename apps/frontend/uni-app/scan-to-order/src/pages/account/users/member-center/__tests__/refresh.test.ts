import { effectScope, reactive } from 'vue'
import { expect, it, vi } from 'vitest'
import { useMemberCenterPage } from '../composables/use-page'

const mocks = vi.hoisted(() => ({
  session: { hasLogin: true, identity: 'customer', sessionRevision: 1, userInfo: { userId: 1 }, updateNowTime: vi.fn() },
  amount: vi.fn(),
  levels: vi.fn(),
}))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), requireIdentity: vi.fn() }))
vi.mock('@/pages/account/assets/asset', () => ({ assetApi: { amount: mocks.amount }, isAssetDemo: () => true }))
vi.mock('../composables/use-requests', () => ({ levelApi: { available: true, levels: mocks.levels } }))

it('旧账户和等级请求未完成时，新账户仍可刷新资产，旧响应不能覆盖新资产', async () => {
  let finishAmount!: (value: unknown) => void
  let finishLevels!: (value: unknown[]) => void
  mocks.amount.mockImplementationOnce(() => new Promise((resolve) => {
    finishAmount = resolve
  })).mockResolvedValueOnce({ balance: 20, score: 2 })
  mocks.levels.mockImplementation(() => new Promise((resolve) => {
    finishLevels = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useMemberCenterPage)!
  try {
    const first = vm.refresh()
    const session = reactive(mocks.session)
    session.userInfo = { userId: 2 }
    session.sessionRevision++
    const second = vm.refresh()
    expect(mocks.amount).toHaveBeenCalledTimes(2)
    finishLevels([])
    await second
    expect(vm.balance.value).toBe('20.00')
    finishAmount({ balance: 999, score: 999 })
    await first
    expect(vm.balance.value).toBe('20.00')
    expect(mocks.levels).toHaveBeenCalledOnce()
  }
  finally { scope.stop() }
})

it('重新进入及刷新失败保留已有等级列表', async () => {
  const levels = [{ id: 1, name: '普通会员', rebate: 10, upgradeAmount: 0 }]
  mocks.amount.mockResolvedValue({ balance: 20, score: 2 })
  mocks.levels.mockResolvedValueOnce(levels).mockRejectedValueOnce(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(useMemberCenterPage)!
  try {
    expect(vm.levelLoading.value).toBe(true)
    await vm.refresh()
    expect(vm.levelList.value).toEqual(levels)
    const retry = vm.refresh()
    expect(vm.levelLoading.value).toBe(true)
    expect(vm.levelList.value).toEqual(levels)
    await retry
    expect(vm.levelFailed.value).toBe(true)
    expect(vm.levelList.value).toEqual(levels)
    expect(vm.levelLoading.value).toBe(false)
  }
  finally { scope.stop() }
})
