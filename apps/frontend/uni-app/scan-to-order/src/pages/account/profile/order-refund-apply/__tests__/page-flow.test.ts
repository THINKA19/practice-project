import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useOrderRefundApplyPage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { clearSession } from '@/pages/auth/session'

const mocks = vi.hoisted(() => ({ detail: vi.fn(), records: vi.fn(), alert: vi.fn(), back: vi.fn() }))
vi.mock('@/pages/account/profile/order', async () => ({
  orderApi: { detail: mocks.detail, refundApplyDetail: mocks.records },
  attachRefundGoods: (await import('../../order/domain/order.rules')).attachRefundGoods,
}))
vi.mock('../composables/use-form', () => ({ useOrderRefundApplyForm: () => ({ initDefaults: vi.fn() }) }))
vi.mock('../composables/use-detail', () => ({ useOrderRefundApplyDetail: () => ({ open: vi.fn() }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ alert: mocks.alert, back: mocks.back, hideLoading: vi.fn(), setTitle: vi.fn(), showLoading: vi.fn() }))
const goods = { id: 1, goodsId: 10, goodsName: '商品', pic: '', number: 1, amount: 10 }
beforeEach(() => {
  seedSession()
  mocks.detail.mockReset().mockResolvedValue({ goods: [goods] })
  mocks.records.mockReset().mockResolvedValue([])
  mocks.alert.mockReset().mockResolvedValue(undefined)
})

it('旧订单读取不能覆盖新订单，也不继续读取旧售后记录', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderRefundApplyPage)!
  try {
    let finish!: (value: { goods: typeof goods[] }) => void
    mocks.detail.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    vm.init({ id: 'old' })
    const pending = vm.loadOrder()
    vm.init({ id: 'new' })
    await vm.loadOrder()
    finish({ goods: [{ ...goods, id: 2 }] })
    await pending
    expect(vm.goods.value[0].id).toBe(1)
    expect(mocks.records).toHaveBeenCalledTimes(1)
    expect(mocks.records).toHaveBeenCalledWith('new')
  }
  finally { scope.stop() }
})

it('售后记录失败时不显示为无历史记录的可申请订单', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderRefundApplyPage)!
  try {
    mocks.records.mockRejectedValueOnce(new Error('records unavailable'))
    vm.init({ id: '1' })
    await vm.loadOrder()
    expect(vm.goods.value).toEqual([])
    expect(mocks.alert).toHaveBeenCalledWith('records unavailable')
  }
  finally { scope.stop() }
})

it('错误提示等待确认时换号，不再执行旧页面的返回', async () => {
  const scope = effectScope()
  const vm = scope.run(useOrderRefundApplyPage)!
  try {
    let close!: () => void
    mocks.detail.mockRejectedValueOnce(new Error('unavailable'))
    mocks.alert.mockReturnValueOnce(new Promise<void>((resolve) => {
      close = resolve
    }))
    vm.init({ id: '1' })
    const pending = vm.loadOrder()
    await Promise.resolve()
    expect(mocks.alert).toHaveBeenCalled()
    clearSession()
    close()
    await pending
    expect(mocks.back).not.toHaveBeenCalled()
  }
  finally { scope.stop() }
})
