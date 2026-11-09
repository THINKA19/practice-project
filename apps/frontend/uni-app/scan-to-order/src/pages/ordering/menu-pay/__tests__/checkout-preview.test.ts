/** 结算金额失败、模式切换与门店边界回归。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { computed, effectScope, ref } from 'vue'
import { usePayOrderPreview } from '../composables/use-order-preview'
import type { OrderPreviewDeps } from '../composables/use-order-preview'

const m = vi.hoisted(() => ({ create: vi.fn(), revision: 0 }))
vi.mock('@/pages/account/profile/order', () => ({ orderApi: { create: m.create } }))
vi.mock('@/pages/auth/session', () => ({ getSessionRevision: () => m.revision }))
vi.mock('@/pages/ordering/menu-cart', async () => ({ toOrderGoodsJson: (await import('../../menu-cart/domain/cart.rules')).toOrderGoodsJson }))
vi.mock('../store', () => ({ useGoodsDraftStore: () => ({ referrer: 0 }) }))
const scopes: ReturnType<typeof effectScope>[] = []
function setup() {
  const scope = effectScope()
  scopes.push(scope)
  const deps = {
    t: (key: string) => key,
    delivery: { shopInfo: ref({ id: 1, name: '本店', businessState: 'open', openWaimai: true, openZiqu: true }), peisongType: ref('zq'), curAddress: ref(null), packagingFee: ref(''), packagingFeeUse: ref('2'), resolvePeisongFeeId: vi.fn().mockResolvedValue(undefined) },
    cards: { curCard: ref(null) },
    diningTime: { enabled: computed(() => false), diningTime: ref('') },
    mobile: ref(''),
    phoneCountry: ref('VN'),
    remark: ref(''),
    query: ref({}),
    onError: vi.fn(),
  } as unknown as OrderPreviewDeps
  const vm = scope.run(() => usePayOrderPreview(deps))!
  vm.goodsList.value = [{ key: 'rice', goodsId: 101, shopId: 1, name: '牛肉饭', pic: '', price: 28, number: 2, minBuyNumber: 1, stores: 50 }]
  return { vm, deps }
}
beforeEach(() => {
  m.create.mockReset()
  m.create.mockResolvedValue({ amountReal: 56, amountTotle: 56, amountLogistics: 0, goodsNumber: 2 })
})
afterEach(() => scopes.splice(0).forEach(scope => scope.stop()))
it('自取无电话、无提货点也可试算，商品小计立即可见', async () => {
  const { vm } = setup()
  expect(vm.subtotal.value).toBe(56)
  await vm.refreshPreview()
  expect(vm.status.value).toBe('ready')
  expect(vm.amountReal.value).toBe(56)
  expect(m.create.mock.calls[0][0]).not.toHaveProperty('pickPointId')
  expect(JSON.parse(m.create.mock.calls[0][0].extJsonStr)).not.toHaveProperty('联系电话')
})

it('自取电话按所选区号规范化，非空非法号码不能提交', async () => {
  const { vm, deps } = setup()
  deps.mobile.value = '0912345678'
  await vm.refreshPreview()
  expect(JSON.parse(m.create.mock.calls[0][0].extJsonStr)['联系电话']).toBe('+84912345678')
  deps.mobile.value = '123'
  expect(await vm.buildPayload(true)).toBeNull()
  deps.mobile.value = '0812345678'
  deps.phoneCountry!.value = 'TH'
  const payload = await vm.buildPayload(true)
  expect(JSON.parse(String(payload?.extJsonStr))['联系电话']).toBe('+66812345678')
})

it('配送提交包含国家地区完整文字，配送资格未确认时不提交', async () => {
  const { vm, deps } = setup()
  deps.delivery.peisongType.value = 'kd'
  deps.delivery.curAddress.value = { id: 2, linkMan: '顾客', mobile: '+84912345678', countryCode: 'VN', regionText: '胡志明市', address: '一号街' }
  await vm.refreshPreview()
  expect(m.create.mock.calls[0][0].address).toBe('越南 · 胡志明市 · 一号街')
  deps.delivery.availabilityReason = computed(() => '无法确认配送距离')
  expect(await vm.buildPayload(true)).toBeNull()
})
it('404 后保留商品小计、进入失败态，重试成功才恢复报价', async () => {
  m.create.mockRejectedValueOnce(new Error('404 request:ok'))
  const { vm } = setup()
  await vm.refreshPreview()
  expect(vm.status.value).toBe('error')
  expect(vm.subtotal.value).toBe(56)
  expect(vm.errorMessage.value).not.toContain('request:ok')
  await vm.refreshPreview()
  expect(vm.status.value).toBe('ready')
})
it('缺失或非法金额不能当成有效零元，明确的零元报价允许展示', async () => {
  const { vm } = setup()
  for (const amountReal of [undefined, '', false, -1, Number.NaN]) {
    m.create.mockResolvedValueOnce({ amountReal, amountTotle: 56 })
    await vm.refreshPreview()
    expect(vm.status.value).toBe('error')
  }
  m.create.mockResolvedValueOnce({ amountReal: 0, amountTotle: 56 })
  await vm.refreshPreview()
  expect(vm.status.value).toBe('ready')
  expect(vm.amountReal.value).toBe(0)
})
it('切换外卖立即失效旧报价，缺地址时不请求试算', async () => {
  const { vm, deps } = setup()
  await vm.refreshPreview()
  deps.delivery.peisongType.value = 'kd'
  expect(vm.status.value).toBe('idle')
  vi.mocked(uni.showToast).mockClear()
  await vm.refreshPreview()
  expect(m.create).toHaveBeenCalledTimes(1)
  expect(vm.status.value).toBe('idle')
  expect(uni.showToast).not.toHaveBeenCalled()
})

it('接口即使返回优惠券也不再参与后续试算和正式提交', async () => {
  const { vm } = setup()
  m.create.mockResolvedValueOnce({ amountReal: 56, amountTotle: 56, amountLogistics: 0, couponUserList: [{ id: 9 }] })
  await vm.refreshPreview()
  expect(m.create.mock.calls[0][0]).not.toHaveProperty('couponId')
  expect(await vm.buildPayload(true)).not.toHaveProperty('couponId')
})
it('跨店商品不参与试算', async () => {
  const { vm } = setup()
  vm.goodsList.value[0]!.shopId = 2
  await vm.refreshPreview()
  expect(m.create).not.toHaveBeenCalled()
})
it('切换方式后迟到的旧试算不能恢复可支付状态', async () => {
  let resolve!: (value: unknown) => void
  m.create.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const { vm, deps } = setup()
  const pending = vm.refreshPreview()
  await Promise.resolve()
  deps.delivery.peisongType.value = 'kd'
  resolve({ amountReal: 56, amountTotle: 56 })
  await pending
  expect(vm.status.value).toBe('idle')
})
