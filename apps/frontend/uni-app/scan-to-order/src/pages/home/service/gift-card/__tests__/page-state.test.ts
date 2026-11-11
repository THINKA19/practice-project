import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useCardPage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const api = vi.hoisted(() => ({ list: vi.fn(), my: vi.fn() }))
const share = vi.hoisted(() => ({ confirm: vi.fn(), close: vi.fn() }))
vi.mock('../composables/use-requests', () => ({ cardApi: api }))
vi.mock('@/utils/project/interaction', () => ({ toast: vi.fn(), showError: vi.fn(), confirm: share.confirm }))
vi.mock('../../gift-card-send', () => ({ cardSendApi: { shareClose: share.close } }))
vi.mock('@/pages/home/index', () => ({ bannerApi: { banners: async () => [] } }))
beforeEach(() => {
  seedSession()
  Object.assign(uni, { setNavigationBarTitle: vi.fn() })
  api.list.mockReset().mockResolvedValue([])
  api.my.mockReset().mockResolvedValue([])
  share.confirm.mockReset()
  share.close.mockReset()
})

it('撤回赠送先确认，取消弹窗不会使旧链接失效', async () => {
  const card = { id: 7, cardId: 1, amount: 50, status: 0, shareToken: 'old-token' }
  const scope = effectScope()
  const vm = scope.run(useCardPage)!
  try {
    share.confirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true)
    await vm.cardShareClose(card)
    expect(share.close).not.toHaveBeenCalled()
    expect(vm.cancellingId.value).toBeNull()
    await vm.cardShareClose(card)
    expect(share.close).toHaveBeenCalledExactlyOnceWith({ id: card.id })
    expect(api.my).toHaveBeenCalledOnce()
  }
  finally { scope.stop() }
})

it('直接进入我的只请求个人卡包，首次显示不重复请求', async () => {
  const scope = effectScope()
  const vm = scope.run(useCardPage)!
  try {
    const first = vm.init({ tab: 'my' })
    await vm.refresh()
    await first
    expect(api.list).not.toHaveBeenCalled()
    expect(api.my).toHaveBeenCalledOnce()
    expect(vm.active.value).toBe(1)
  }
  finally {
    scope.stop()
  }
})

it('切到我的后，迟到的目录响应不能覆盖我的错误状态', async () => {
  let finish!: (rows: unknown[]) => void
  api.list.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  api.my.mockRejectedValueOnce(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(useCardPage)!
  try {
    const catalog = vm.init()
    await vm.tabChange(1)
    expect(vm.failed.value).toBe(true)
    finish([])
    await catalog
    expect(vm.failed.value).toBe(true)
    expect(vm.loading.value).toBe(false)
    await vm.tabChange(0)
    expect(vm.failed.value).toBe(false)
  }
  finally {
    scope.stop()
  }
})

it('多于四张卡可逐批展示，购买成功重新读取我的卡包', async () => {
  api.list.mockResolvedValue(Array.from({ length: 27 }, (_, i) => ({ id: i + 1, name: '卡', price: 50, amount: 50 })))
  const scope = effectScope()
  const vm = scope.run(useCardPage)!
  try {
    await vm.init()
    expect(vm.visibleCards.value).toHaveLength(12)
    vm.loadMore()
    expect(vm.visibleCards.value).toHaveLength(24)
    vm.loadMore()
    expect(vm.visibleCards.value).toHaveLength(27)
    expect(vm.hasMore.value).toBe(false)
    vm.buy(vm.cardList.value[20])
    expect(vm.paymentShow.value).toBe(true)
    expect(vm.nextAction.value).toEqual({ type: 10, id: 21 })
    api.my.mockResolvedValue([{ id: 100, cardId: 21, amount: 50 }])
    await vm.paymentOk()
    expect(vm.active.value).toBe(1)
    expect(vm.cardMyList.value[0].id).toBe(100)
    expect(vm.paymentShow.value).toBe(false)
  }
  finally { scope.stop() }
})

it('支付返回时强制刷新，较早的卡包响应不能覆盖支付后的数据', async () => {
  let finish!: (rows: unknown[]) => void
  api.my.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useCardPage)!
  try {
    const old = vm.tabChange(1)
    vm.buy({ id: 2, name: '卡', price: 50, amount: 50 })
    api.my.mockResolvedValueOnce([{ id: 8 }])
    await vm.paymentOk()
    finish([])
    await old
    expect(vm.cardMyList.value).toEqual([{ id: 8 }])
  }
  finally { scope.stop() }
})
