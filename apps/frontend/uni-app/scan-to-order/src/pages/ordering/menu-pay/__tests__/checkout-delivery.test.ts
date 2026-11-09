/** 地址错误与模式切换的迟到响应回归。 */
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { effectScope, reactive } from 'vue'
import { usePayDelivery } from '../composables/use-delivery'

const m = vi.hoisted(() => ({ meters: 0, address: vi.fn(), fees: vi.fn(), session: { revision: 0 }, shop: { current: { id: 1, name: '本店', openWaimai: true, openZiqu: true }, peisongType: 'kd', isScanMode: false, setPeisongType: vi.fn() } }))
vi.mock('@/pages/ordering/index', () => ({ useShopStore: () => m.shop, orderingSettings: {}, distanceLine: () => m.meters }))
vi.mock('@/pages/auth/session', () => ({ getSessionRevision: () => m.session.revision }))
vi.mock('@/pages/account/profile/address', () => ({ addressApi: { list: m.address } }))
vi.mock('../api/payment.api', () => ({ paymentApi: { peisongFeeList: m.fees } }))
vi.mock('@/pages/ordering/menu', () => ({ isApiError: () => false }))
const scopes: ReturnType<typeof effectScope>[] = []
function setup() {
  m.shop = reactive(m.shop)
  m.session = reactive(m.session)
  const scope = effectScope()
  scopes.push(scope)
  const vm = scope.run(() => usePayDelivery(key => key))!
  vm.syncShopAndType()
  return vm
}
beforeEach(() => {
  m.meters = 0
  m.address.mockReset().mockResolvedValue([])
  m.fees.mockReset().mockResolvedValue([])
  vi.mocked(uni.navigateTo).mockClear()
  m.shop.current = { id: 1, name: '本店', openWaimai: true, openZiqu: true }
  m.shop.isScanMode = false
  m.shop.peisongType = 'kd'
  m.shop.setPeisongType.mockImplementation((type: string) => {
    m.shop.peisongType = type
  })
})

const addresses = [
  { id: 1, linkMan: '甲', mobile: '+84912345678', address: '默认地址', isDefault: true },
  { id: 2, linkMan: '乙', mobile: '+66812345678', address: '本次地址', isDefault: false },
]
it('需要坐标的第三方配送可直接进入当前地址编辑补充定位', async () => {
  m.address.mockResolvedValue([addresses[0]])
  const vm = setup()
  Object.assign(m.shop.current, { expressType: 'dada' })
  await vm.loadDefaultAddress()
  expect(vm.deliveryIssue.value?.actionText).toBe('补充定位')
  vm.goAddress(true)
  expect(vi.mocked(uni.navigateTo).mock.calls.at(-1)![0].url).toContain('&id=1')
})
it('唯一地址未设默认时自动带出；配送切换开始就进入加载态', async () => {
  m.address.mockResolvedValue([{ ...addresses[0], isDefault: false }])
  const vm = setup()
  expect(vm.addressLoading.value).toBe(true)
  await vm.loadDefaultAddress()
  expect(vm.curAddress.value?.id).toBe(1)
  vm.selectPeisongType('zq')
  vm.selectPeisongType('kd')
  expect(vm.addressLoading.value).toBe(true)
})
it('存在地址但没有默认地址时显示选择入口，不误认为没有地址', async () => {
  m.address.mockResolvedValue(addresses.map(item => ({ ...item, isDefault: false })))
  const vm = setup()
  await vm.loadDefaultAddress()
  expect(vm.hasAddresses.value).toBe(true)
  expect(vm.curAddress.value).toBeNull()
  expect(vm.availabilityReason.value).toBe('请选择收货地址')
})

it('本次选择优先于默认，取消选择或切换自取再返回配送仍保留', async () => {
  m.address.mockResolvedValue(addresses)
  const vm = setup()
  await vm.loadDefaultAddress()
  expect(vm.curAddress.value?.id).toBe(1)
  vm.goAddress()
  const options = vi.mocked(uni.navigateTo).mock.calls.at(-1)![0]
  expect(options.url).toContain('select=1')
  options.events!.addressSelected({ id: 2 })
  await vm.loadDefaultAddress()
  expect(vm.curAddress.value?.id).toBe(2)
  vm.goAddress()
  await vm.loadDefaultAddress()
  expect(vm.curAddress.value?.id).toBe(2)
  vm.selectPeisongType('zq')
  vm.selectPeisongType('kd')
  await vm.loadDefaultAddress()
  expect(vm.curAddress.value?.id).toBe(2)
})

it('选中地址删除后回退默认；换账号忽略旧选择事件', async () => {
  m.address.mockResolvedValue(addresses)
  const vm = setup()
  await vm.loadDefaultAddress()
  vm.goAddress()
  const callback = vi.mocked(uni.navigateTo).mock.calls.at(-1)![0].events!.addressSelected
  callback({ id: 2 })
  await vm.loadDefaultAddress()
  m.address.mockResolvedValue([addresses[0]])
  await vm.loadDefaultAddress()
  expect(vm.curAddress.value?.id).toBe(1)
  m.session.revision++
  expect(vm.curAddress.value).toBeNull()
  callback({ id: 2 })
  m.address.mockResolvedValue(addresses)
  await vm.loadDefaultAddress()
  expect(vm.curAddress.value?.id).toBe(1)
})

it('缺少定位是未知距离，不能匹配成零公里；合法零坐标可计算', async () => {
  m.address.mockResolvedValue([addresses[0]])
  const vm = setup()
  Object.assign(m.shop.current, { serviceDistance: 5, latitude: 0, longitude: 0 })
  await vm.loadDefaultAddress()
  expect(vm.distance.value).toBeNull()
  expect(vm.deliveryIssue.value).toBeNull()
  expect(vm.availabilityReason.value).toBe('')
  expect(await vm.resolvePeisongFeeId()).toBeUndefined()
  m.address.mockResolvedValue([{ ...addresses[0], latitude: 0, longitude: 0 }])
  await vm.loadDefaultAddress()
  expect(vm.distance.value).toBe(0)
  expect(vm.availabilityReason.value).toBe('')
})

it('门店缺少坐标不归咎于收货地址，真实超范围才显示不支持配送', async () => {
  m.address.mockResolvedValue([{ ...addresses[0], latitude: 0, longitude: 0 }])
  const vm = setup()
  Object.assign(m.shop.current, { serviceDistance: 5 })
  await vm.loadDefaultAddress()
  expect(vm.deliveryIssue.value).toBeNull()
  Object.assign(m.shop.current, { latitude: 0, longitude: 0 })
  m.meters = 6000
  await vm.loadDefaultAddress()
  expect(vm.deliveryIssue.value?.kind).toBe('range')
  expect(vm.deliveryIssue.value?.actionText).toBe('更换地址')
})

it('有距离但没有覆盖的费用档位时阻止默认运费，允许匹配零公里', async () => {
  m.address.mockResolvedValue([{ ...addresses[0], latitude: 0, longitude: 0 }])
  m.fees.mockResolvedValue([{ id: 1, distance: 3 }])
  const vm = setup()
  Object.assign(m.shop.current, { latitude: 0, longitude: 0 })
  m.meters = 5000
  await Promise.all([vm.loadDefaultAddress(), vm.loadPeisongFeeList()])
  expect(vm.deliveryIssue.value?.kind).toBe('range')
  await expect(vm.resolvePeisongFeeId()).rejects.toThrow('计费范围')
  m.meters = 0
  await vm.loadDefaultAddress()
  expect(vm.deliveryIssue.value).toBeNull()
  expect(await vm.resolvePeisongFeeId()).toBe(1)
})

it('配送费加载失败可重试，切回自取后迟到的配送费不能恢复', async () => {
  m.address.mockResolvedValue([addresses[0]])
  const vm = setup()
  await vm.loadDefaultAddress()
  m.fees.mockRejectedValueOnce(new Error('offline'))
  await vm.loadPeisongFeeList()
  expect(vm.feeError.value).toBe(true)
  expect(vm.availabilityReason.value).toBe('')
  await vm.loadPeisongFeeList()
  expect(vm.feeError.value).toBe(false)
  let finish!: (value: unknown) => void
  m.fees.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const pending = vm.loadPeisongFeeList()
  vm.selectPeisongType('zq')
  finish([{ id: 9, distance: 5 }])
  await pending
  vm.selectPeisongType('kd')
  expect(await vm.resolvePeisongFeeId()).toBeUndefined()
})
afterEach(() => scopes.splice(0).forEach(scope => scope.stop()))
it('无地址与地址请求失败有不同状态，重试成功清除错误', async () => {
  const vm = setup()
  m.address.mockResolvedValueOnce([])
  await vm.loadDefaultAddress()
  expect(vm.addressError.value).toBe(false)
  m.address.mockRejectedValueOnce(new Error('404'))
  await expect(vm.loadDefaultAddress()).rejects.toThrow()
  expect(vm.addressError.value).toBe(true)
  m.address.mockResolvedValueOnce([{ id: 1, address: '本地地址', isDefault: true }])
  await vm.loadDefaultAddress()
  expect(vm.addressError.value).toBe(false)
  expect(vm.curAddress.value?.id).toBe(1)
})
it('切回自取后旧地址响应不能写回，也不能恢复加载状态', async () => {
  let resolve!: (value: unknown) => void
  m.address.mockReturnValueOnce(new Promise((done) => {
    resolve = done
  }))
  const vm = setup()
  const pending = vm.loadDefaultAddress()
  vm.selectPeisongType('zq')
  resolve([{ id: 1, address: '旧地址', isDefault: true }])
  await pending
  expect(vm.curAddress.value).toBeNull()
  expect(vm.addressLoading.value).toBe(false)
})
it('桌码模式不能在普通结算切换为自取或配送', () => {
  const vm = setup()
  m.shop.isScanMode = true
  expect(vm.selectPeisongType('zq')).toBe(false)
  expect(m.shop.setPeisongType).not.toHaveBeenCalled()
})
