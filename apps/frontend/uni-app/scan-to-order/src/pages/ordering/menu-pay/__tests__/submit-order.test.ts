/** 结算业务回归：重复提交、重试与跨账号迟到响应。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { computed, effectScope, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { usePaySubmitOrder } from '../composables/use-submit-order'
import type { SubmitOrderDeps } from '../composables/use-submit-order'
import { ClientRoutes } from '@/pages/routes'

const m = vi.hoisted(() => ({ ensureAvailable: vi.fn(), create: vi.fn(), clear: vi.fn(), confirm: vi.fn(), redirect: vi.fn(), allowed: true, revision: 1, resets: [] as Array<() => void> }))
vi.mock('@/pages/auth/session', () => ({ requireIdentity: () => m.allowed, useSessionAccountScope: (reset: () => void) => {
  m.resets.push(reset)
  return { ticket: () => m.revision, current: (ticket: number) => ticket === m.revision }
} }))
vi.mock('@/pages/ordering/menu-cart', () => ({ useCartStore: () => ({ clear: m.clear }) }))
vi.mock('@/pages/account/profile/order', () => ({ orderApi: { create: m.create } }))
vi.mock('@/utils/project/interaction', () => ({ confirm: m.confirm, toast: vi.fn() }))
vi.mock('@/pages/ordering/index', () => ({ orderingSettings: {}, useShopCheckoutAvailability: () => ({ reason: ref(''), ensureAvailable: m.ensureAvailable }) }))
vi.mock('@/pages/ordering/menu', () => ({ redirect: m.redirect, requestSubscribe: vi.fn() }))
const scopes: ReturnType<typeof effectScope>[] = []
function create() {
  const scope = effectScope()
  scopes.push(scope)
  const deps: SubmitOrderDeps = {
    t: key => key,
    delivery: { peisongType: ref('zq'), isOutOfRange: () => false },
    diningTime: { diningTime: ref(''), enabled: computed(() => false) },
    preview: { status: ref('ready'), amountReal: ref(28), buildPayload: vi.fn().mockResolvedValue({ goodsJsonStr: '[{"goodsId":101,"number":1}]', remark: '' }) },
    mobile: ref('13800000000'),
    orderType: ref(''),
    onError: vi.fn(),
  }
  return { vm: scope.run(() => usePaySubmitOrder(deps))!, deps }
}
beforeEach(() => {
  vi.resetAllMocks()
  m.allowed = true
  m.revision = 1
  m.resets = []
  m.create.mockResolvedValue({ id: 15, amountReal: 28, status: 0 })
  m.clear.mockResolvedValue(null)
  m.confirm.mockResolvedValue(true)
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
})
it('未登录不试算、不下单，也不清空购物车', async () => {
  m.allowed = false
  const { vm, deps } = create()
  await vm.goCreateOrder()
  expect(deps.preview.buildPayload).not.toHaveBeenCalled()
  expect(m.create).not.toHaveBeenCalled()
  expect(m.clear).not.toHaveBeenCalled()
})

it('提交前门店暂停营业，不创建订单、不清空购物车，恢复后可重试', async () => {
  m.ensureAvailable.mockRejectedValueOnce(new Error('暂停营业，暂不可结算'))
  const { vm } = create()
  await vm.goCreateOrder()
  expect(m.create).not.toHaveBeenCalled()
  expect(m.clear).not.toHaveBeenCalled()
  expect(vm.submitLoading.value).toBe(false)
  await vm.goCreateOrder()
  expect(m.create).toHaveBeenCalledTimes(1)
})
it('下单响应返回前连续点击只提交一次', async () => {
  let resolve!: (value: { id: number, amountReal: number, status: number }) => void
  m.create.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const { vm } = create()
  const first = vm.goCreateOrder()
  await flushPromises()
  await vm.goCreateOrder()
  expect(m.create).toHaveBeenCalledTimes(1)
  resolve({ id: 15, amountReal: 28, status: 0 })
  await first
  expect(vm.submitLoading.value).toBe(false)
})
it('点击后直接提交订单，不打开支付或二次确认弹窗', async () => {
  const { vm } = create()
  await vm.goCreateOrder()
  expect(m.create).toHaveBeenCalledTimes(1)
  expect(m.clear).toHaveBeenCalledTimes(1)
  expect(m.redirect).toHaveBeenCalledTimes(1)
  expect(m.redirect).toHaveBeenCalledWith(ClientRoutes.Account.orderDetail, { id: 15, submitted: '1' })
  expect(m.confirm).not.toHaveBeenCalled()
})
it('成功后重复点击只继续原订单跳转，不创建第二单', async () => {
  const { vm } = create()
  await vm.goCreateOrder()
  await vm.goCreateOrder()
  expect(m.create).toHaveBeenCalledTimes(1)
  expect(m.clear).toHaveBeenCalledTimes(1)
  expect(m.confirm).not.toHaveBeenCalled()
})
it('请求失败后重试携带同一 requestId，不把失败当作已创建', async () => {
  m.create.mockRejectedValueOnce(new Error('连接中断'))
  const { vm, deps } = create()
  await vm.goCreateOrder()
  expect(deps.onError).toHaveBeenCalled()
  expect(m.clear).not.toHaveBeenCalled()
  expect(deps.preview.amountReal.value).toBe(28)
  expect(deps.preview.status.value).toBe('ready')
  await vm.goCreateOrder()
  expect(m.create.mock.calls[0][0].requestId).toBe(m.create.mock.calls[1][0].requestId)
})

it('校验期间金额或表单变化不提交过时订单', async () => {
  let finish!: () => void
  m.ensureAvailable.mockImplementationOnce(() => new Promise<void>((resolve) => {
    finish = resolve
  }))
  const { vm, deps } = create()
  const pending = vm.goCreateOrder()
  await flushPromises()
  deps.preview.amountReal.value = 30
  finish()
  await pending
  expect(m.create).not.toHaveBeenCalled()
  expect(m.clear).not.toHaveBeenCalled()
  expect(vm.submitLoading.value).toBe(false)
})

it('已创建订单后购物车同步失败，仍可查看订单且不重复创建', async () => {
  m.clear.mockRejectedValueOnce(new Error('sync failed'))
  const { vm } = create()
  await vm.goCreateOrder()
  expect(m.redirect).toHaveBeenCalledTimes(1)
  await vm.goCreateOrder()
  expect(m.create).toHaveBeenCalledTimes(1)
})
it('账号切换后旧下单响应不清空新账号购物车、不触发支付', async () => {
  let resolve!: (value: { id: number, amountReal: number }) => void
  m.create.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const { vm } = create()
  const pending = vm.goCreateOrder()
  await flushPromises()
  m.revision++
  m.resets.forEach(reset => reset())
  resolve({ id: 15, amountReal: 28 })
  await pending
  expect(m.clear).not.toHaveBeenCalled()
})
it('无效下单响应不清空购物车、不跳转成功页面', async () => {
  m.create.mockResolvedValueOnce({ id: 0, amountReal: -1 })
  const { vm, deps } = create()
  await vm.goCreateOrder()
  expect(m.clear).not.toHaveBeenCalled()
  expect(deps.onError).toHaveBeenCalled()
  expect(m.redirect).not.toHaveBeenCalled()
})

it('试算准备异常也会解锁提交按钮，允许用户明确重试', async () => {
  const { vm, deps } = create()
  vi.mocked(deps.preview.buildPayload).mockRejectedValueOnce(new Error('配送信息查询失败'))
  await vm.goCreateOrder()
  expect(vm.submitLoading.value).toBe(false)
  expect(deps.onError).toHaveBeenCalled()
  expect(m.create).not.toHaveBeenCalled()
})

it('试算未成功时禁止下单；自取电话为空不阻断有效报价下单', async () => {
  const { vm, deps } = create()
  deps.mobile.value = ''
  deps.preview.status.value = 'error'
  await vm.goCreateOrder()
  expect(m.create).not.toHaveBeenCalled()
  deps.preview.status.value = 'ready'
  await vm.goCreateOrder()
  expect(m.create).toHaveBeenCalledTimes(1)
})
