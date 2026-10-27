import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useCouponPage } from '../composables/use-page'

const mocks = vi.hoisted(() => ({
  session: { sessionRevision: 0, identity: null as string | null, hasLogin: false, userInfo: { userId: 1 }, updateNowTime: vi.fn() },
  api: { templates: vi.fn(), my: vi.fn(), detail: vi.fn(), fetch: vi.fn(), exchange: vi.fn() },
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, tm: () => ['可领', '已领', '失效', '口令'] }) }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), requireIdentity: () => true, AUTH_ROUTES: { customer: '/pages/auth/login/index' } }))
vi.mock('../composables/use-context', () => ({ isAssetDemo: () => true }))
vi.mock('../composables/use-requests', () => ({ couponApi: mocks.api }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn().mockResolvedValue({ ok: true }) }))
beforeEach(() => {
  mocks.session.sessionRevision = 0
  Object.values(mocks.api).forEach(fn => fn.mockReset())
})
it('快速切换标签时旧券池不能覆盖新列表，切换账户清空个人券', async () => {
  let resolve!: (value: { list: { id: number }[] }) => void
  mocks.api.templates.mockImplementation(() => new Promise((done) => {
    resolve = done
  }))
  mocks.api.my.mockResolvedValue({ list: [{ id: 9, pid: 1, status: 0, dateEnd: '2027-01-01 12:00:00' }], total: 1 })
  const scope = effectScope()
  const vm = scope.run(() => useCouponPage())!
  try {
    const previous = vm.refresh()
    await vm.tabClick(1)
    resolve({ list: [{ id: 1 }] })
    await previous
    expect(vm.templates.value).toEqual([])
    expect(vm.mine.value[0]?.id).toBe(9)
    expect(vm.mine.value[0]?.dateEnd).toBe('2027-01-01')
    reactive(mocks.session).sessionRevision++
    expect(vm.mine.value).toEqual([])
  }
  finally { scope.stop() }
})
it('领取和兑换失败后解除提交锁，不把失败报告为成功', async () => {
  mocks.api.fetch.mockRejectedValue(new Error('请求错误[20003]：已领取'))
  mocks.api.exchange.mockRejectedValue(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(() => useCouponPage())!
  try {
    await vm.fetch.getCounpon({ id: 1, name: '券', moneyMin: 5, moneyMax: 5, moneyHreshold: 20 })
    expect(vm.fetch.fetching.value).toBe(false)
    expect(uni.showModal).toHaveBeenCalledWith(expect.objectContaining({ content: 'coupons.receivedgreedy' }))
    vm.exchange.number.value = 'DEMO2026'
    vm.exchange.pwd.value = 'DEMO'
    await vm.exchange.exchangeCoupons()
    expect(vm.exchange.exchangeCouponsLoading.value).toBe(false)
    expect(vm.exchange.number.value).toBe('DEMO2026')
    expect(uni.showToast).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'coupons.Redemption' }))
  }
  finally { scope.stop() }
})

it('领取成功后禁用重复领取，刷新后仍保留已领取状态，换账户清空', async () => {
  mocks.api.fetch.mockResolvedValue(null)
  mocks.api.templates.mockRejectedValue(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(() => useCouponPage())!
  const item = { id: 10, name: '券', moneyMin: 5, moneyMax: 5, moneyHreshold: 20 }
  try {
    await vm.fetch.getCounpon(item)
    expect(vm.fetch.claimedIds.value.has(10)).toBe(true)
    await vm.refresh()
    expect(vm.failed.value).toBe(true)
    await vm.fetch.getCounpon(item)
    expect(mocks.api.fetch).toHaveBeenCalledOnce()
    vm.fetch.closePwd()
    expect(vm.fetch.claimedIds.value.has(10)).toBe(true)
    reactive(mocks.session).sessionRevision++
    expect(vm.fetch.claimedIds.value.size).toBe(0)
  }
  finally { scope.stop() }
})

it('优惠券首次十五条，触底追加十五条，短页结束，领取期间显示当前券', async () => {
  const rows = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }))
  mocks.api.templates.mockResolvedValueOnce({ list: rows }).mockResolvedValueOnce({ list: [{ id: 16 }] })
  const scope = effectScope()
  const vm = scope.run(() => useCouponPage())!
  try {
    await vm.refresh()
    expect(mocks.api.templates).toHaveBeenLastCalledWith({ page: 1, pageSize: 15 })
    expect(vm.finished.value).toBe(false)
    await vm.loadMore()
    expect(vm.templates.value).toHaveLength(16)
    expect(mocks.api.templates).toHaveBeenLastCalledWith({ page: 2, pageSize: 15 })
    expect(vm.finished.value).toBe(true)
    let complete!: () => void
    mocks.api.fetch.mockImplementation(() => new Promise<void>((resolve) => {
      complete = resolve
    }))
    const claim = vm.fetch.getCounpon({ id: 1, name: '券', moneyMin: 5, moneyMax: 5, moneyHreshold: 20 })
    expect(vm.fetch.fetchingId.value).toBe(1)
    await vm.fetch.getCounpon({ id: 2, name: '券', moneyMin: 5, moneyMax: 5, moneyHreshold: 20 })
    expect(mocks.api.fetch).toHaveBeenCalledOnce()
    complete()
    await claim
    expect(vm.fetch.fetchingId.value).toBeNull()
    expect(vm.fetch.claimedIds.value.has(1)).toBe(true)
  }
  finally { scope.stop() }
})
