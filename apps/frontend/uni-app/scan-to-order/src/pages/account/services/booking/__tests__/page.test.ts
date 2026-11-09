import { computed, effectScope, reactive, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useBookingForm } from '../composables/use-form'

const mocks = vi.hoisted(() => ({ session: { hasLogin: true, identity: 'customer', sessionRevision: 1, updateNowTime: vi.fn() }, info: vi.fn(), join: vi.fn(), toast: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, locale: ref('zh-Hans') }) }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session) }))
vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
vi.mock('@/utils/project/feedback', () => ({ toast: mocks.toast }))
vi.mock('../composables/use-requests', () => ({ bookingApi: { info: mocks.info, join: mocks.join } }))
beforeEach(() => {
  vi.setSystemTime(new Date(2098, 11, 31, 12))
  mocks.session.sessionRevision = 1
  mocks.info.mockReset().mockResolvedValue({ id: 'booking', slots: ['2099-01-01 12:00'] })
  mocks.join.mockReset().mockResolvedValue({ accepted: true })
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('onLoad', (callback: (query: { shopId: string, shopName: string }) => void) => callback({ shopId: '1', shopName: encodeURIComponent('北门店 & 茶座') }))
})
afterEach(() => vi.useRealTimers())

async function setup() {
  const scope = effectScope()
  const vm = scope.run(useBookingForm)!
  await Promise.resolve()
  vm.name.value = '张三'
  vm.mobile.value = '0912345678'
  vm.time.value = '2099-01-01 12:00'
  return { scope, vm }
}
it('loads only the selected shop and rejects a time outside its offered slots', async () => {
  const { scope, vm } = await setup()
  expect(mocks.info).toHaveBeenCalledWith(1)
  vm.time.value = '2099-01-01 14:00'
  await vm.submit()
  expect(mocks.join).not.toHaveBeenCalled()
  scope.stop()
})
it.each(['account', 'dispose'])('ignores the late booking success after %s changes', async (change) => {
  let finish!: (value: object) => void
  mocks.join.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const { scope, vm } = await setup()
  const pending = vm.submit()
  await vm.submit()
  expect(mocks.join).toHaveBeenCalledTimes(1)
  if (change === 'account') {
    reactive(mocks.session).sessionRevision++
    expect(vm.name.value).toBe('')
  }
  else {
    scope.stop()
  }
  finish({ accepted: true })
  await pending
  expect(uni.navigateBack).not.toHaveBeenCalled()
  expect(mocks.toast).not.toHaveBeenCalledWith('common.submitSuccess')
  scope.stop()
})
it('does not report a missing response as booking success', async () => {
  mocks.join.mockResolvedValueOnce(undefined)
  const { scope, vm } = await setup()
  await vm.submit()
  expect(uni.navigateBack).not.toHaveBeenCalled()
  expect(mocks.toast).toHaveBeenCalledWith('预约结果未确认，请联系门店核对，勿重复提交')
  scope.stop()
})

it.each([null, {}, { accepted: false }])('does not accept an invalid booking result: %j', async (result) => {
  mocks.join.mockResolvedValueOnce(result)
  const { scope, vm } = await setup()
  await vm.submit()
  expect(vm.pending.value).toBe(true)
  await vm.submit()
  expect(mocks.join).toHaveBeenCalledTimes(1)
  expect(uni.navigateBack).not.toHaveBeenCalled()
  scope.stop()
})
it('blocks repeated submission after a lost response', async () => {
  mocks.join.mockRejectedValueOnce(new Error('timeout'))
  const { scope, vm } = await setup()
  await vm.submit()
  await vm.submit()
  expect(vm.pending.value).toBe(true)
  expect(vm.submitting.value).toBe(false)
  expect(mocks.join).toHaveBeenCalledTimes(1)
  scope.stop()
})
it('retries failed configuration and submits only after it is ready', async () => {
  const { scope, vm } = await setup()
  mocks.info.mockRejectedValueOnce(new Error('offline'))
  await vm.load()
  expect(vm.configFailed.value).toBe(true)
  await vm.submit()
  expect(mocks.join).not.toHaveBeenCalled()
  mocks.info.mockResolvedValueOnce({ id: 'restored', slots: ['2099-01-01 12:00'] })
  await vm.load()
  expect(vm.configFailed.value).toBe(false)
  await vm.submit()
  expect(mocks.join).toHaveBeenCalledWith(expect.objectContaining({ yuyueId: 'restored' }))
  scope.stop()
})

it('only exposes upcoming slots within a week, sorted and deduplicated', async () => {
  mocks.info.mockResolvedValueOnce({
    id: 'booking',
    slots: ['2099-01-07 14:00', '2099-01-01 13:00', '2099-01-01 08:00', '2099-01-01 12:30', '2099-01-03 18:00', '2099-01-01 12:00', '2099-01-01 12:00', '2098-12-31 11:50'],
  })
  const { scope, vm } = await setup()
  expect(vm.slots.value).toEqual(['2099-01-01 12:00', '2099-01-03 18:00'])
  scope.stop()
})

it('keeps the selected shop name after loading booking configuration', async () => {
  mocks.info.mockResolvedValueOnce({ id: 'booking', shopName: '预约门店 1', slots: [] })
  const { scope, vm } = await setup()
  expect(vm.shopName.value).toBe('北门店 & 茶座')
  scope.stop()
})

it('does not submit a numeric exponent as a phone number', async () => {
  const { scope, vm } = await setup()
  vm.mobile.value = '-2e-18'
  await vm.submit()
  expect(mocks.join).not.toHaveBeenCalled()
  expect(mocks.toast).toHaveBeenCalledWith('booking.mobileInvalid')
  scope.stop()
})

it('keeps the draft until another shop is picked and clears only its previous time', async () => {
  const { scope, vm } = await setup()
  vm.selectPeople(2)
  vm.chooseShop()
  const navigation = vi.mocked(uni.navigateTo).mock.lastCall?.[0]
  expect(navigation?.url).toContain('change=1&shopId=1')
  expect(vm.time.value).toBe('2099-01-01 12:00')
  navigation?.events?.bookingShopSelected(3, '南门店', '第三郡 · 主街', '/shops/south.png')
  expect(vm.shopName.value).toBe('南门店')
  expect(vm.shopAddress.value).toBe('第三郡 · 主街')
  expect(vm.shopPic.value).toBe('/shops/south.png')
  expect(vm.time.value).toBe('')
  expect(vm.personIndex.value).toBe(2)
  expect(vm.name.value).toBe('张三')
  expect(vm.mobile.value).toBe('0912345678')
  expect(mocks.info).toHaveBeenLastCalledWith(3)
  scope.stop()
})
