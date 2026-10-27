import { computed, effectScope, reactive, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useBookingForm } from '../composables/use-form'

const mocks = vi.hoisted(() => ({ session: { hasLogin: true, identity: 'customer', sessionRevision: 1, updateNowTime: vi.fn() }, info: vi.fn(), join: vi.fn(), toast: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, locale: ref('zh-Hans') }) }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session) }))
vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
vi.mock('@/utils/project/feedback', () => ({ toast: mocks.toast }))
vi.mock('../composables/use-requests', () => ({ bookingApi: { info: mocks.info, join: mocks.join } }))
beforeEach(() => {
  mocks.session.sessionRevision = 1
  mocks.join.mockReset().mockResolvedValue({ accepted: true })
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('onLoad', (callback: (query: { yuyueId: string }) => void) => callback({ yuyueId: 'booking' }))
})
function setup() {
  const scope = effectScope()
  const vm = scope.run(useBookingForm)!
  vm.name.value = '张三'
  vm.mobile.value = '12345'
  vm.time.value = '2099-01-01 12:00'
  return { scope, vm }
}
it('refreshes the date lower bound when reopening the picker', () => {
  const { scope, vm } = setup()
  vm.minDate.value = 0
  vm.currentDate.value = 0
  vm.openTime()
  expect(vm.minDate.value).toBeGreaterThan(0)
  expect(vm.currentDate.value).toBeGreaterThanOrEqual(vm.minDate.value)
  expect(new Date(vm.currentDate.value).getMinutes() % 10).toBe(0)
  scope.stop()
})
it.each(['account', 'dispose'])('ignores the late booking success after %s changes', async (change) => {
  let finish!: (value: object) => void
  mocks.join.mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const { scope, vm } = setup()
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
  const { scope, vm } = setup()
  await vm.submit()
  expect(uni.navigateBack).not.toHaveBeenCalled()
  expect(mocks.toast).toHaveBeenCalledWith('预约结果未确认，请联系门店核对，勿重复提交')
  scope.stop()
})

it.each([null, {}, { accepted: false }])('does not accept an invalid booking result: %j', async (result) => {
  mocks.join.mockResolvedValueOnce(result)
  const { scope, vm } = setup()
  await vm.submit()
  expect(vm.pending.value).toBe(true)
  await vm.submit()
  expect(mocks.join).toHaveBeenCalledTimes(1)
  expect(uni.navigateBack).not.toHaveBeenCalled()
  scope.stop()
})
it('blocks repeated submission after a lost response', async () => {
  mocks.join.mockRejectedValueOnce(new Error('timeout'))
  const { scope, vm } = setup()
  await vm.submit()
  await vm.submit()
  expect(vm.pending.value).toBe(true)
  expect(vm.submitting.value).toBe(false)
  expect(mocks.join).toHaveBeenCalledTimes(1)
  scope.stop()
})
it('retries failed configuration and submits only after it is ready', async () => {
  const { scope, vm } = setup()
  mocks.info.mockRejectedValueOnce(new Error('offline'))
  await vm.load()
  expect(vm.configFailed.value).toBe(true)
  await vm.submit()
  expect(mocks.join).not.toHaveBeenCalled()
  mocks.info.mockResolvedValueOnce({ id: 'restored' })
  await vm.load()
  expect(vm.configFailed.value).toBe(false)
  await vm.submit()
  expect(mocks.join).toHaveBeenCalledWith(expect.objectContaining({ yuyueId: 'restored' }))
  scope.stop()
})
