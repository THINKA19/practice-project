import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { usePayPickupContact } from '../composables/use-pickup-contact'

const m = vi.hoisted(() => ({ list: vi.fn(), revision: 0, reset: () => {} }))
vi.mock('@/pages/account/profile/address', () => ({ addressApi: { list: m.list } }))
vi.mock('@/pages/auth/session', () => ({
  getSessionRevision: () => m.revision,
  useSessionAccountScope: (reset: () => void) => { m.reset = reset },
}))
const scopes: ReturnType<typeof effectScope>[] = []
function setup() {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(usePayPickupContact)!
}
beforeEach(() => {
  m.revision = 0
  m.list.mockReset().mockResolvedValue([{ id: 1, mobile: '0812345678', phoneCountry: 'TH', isDefault: true }])
})
afterEach(() => scopes.splice(0).forEach(scope => scope.stop()))
it('回填默认地址电话和区号并说明来源；刷新不覆盖本次修改或清空', async () => {
  const vm = setup()
  await vm.loadContact()
  expect(vm.mobile.value).toBe('812345678')
  expect(vm.phoneCountry.value).toBe('TH')
  expect(vm.contactSource.value).toContain('默认地址')
  vm.mobile.value = ''
  await vm.loadContact()
  expect(vm.mobile.value).toBe('')
  expect(m.list).toHaveBeenCalledTimes(1)
})
it('等待接口时手动输入不会被迟到的号码覆盖', async () => {
  let resolve!: (value: unknown) => void
  m.list.mockImplementation(() => new Promise((r) => {
    resolve = r
  }))
  const vm = setup()
  const task = vm.loadContact()
  vm.mobile.value = '0912345678'
  resolve([{ mobile: '+66812345678', isDefault: true }])
  await task
  expect(vm.mobile.value).toBe('0912345678')
  expect(vm.contactLoading.value).toBe(false)
})
it('换号和销毁后不回填旧账号电话；失败允许重试', async () => {
  let resolve!: (value: unknown) => void
  m.list.mockImplementationOnce(() => new Promise((r) => {
    resolve = r
  }))
  const vm = setup()
  const task = vm.loadContact()
  m.revision++
  m.reset()
  resolve([{ mobile: '+66812345678', isDefault: true }])
  await task
  expect(vm.mobile.value).toBe('')
  m.list.mockRejectedValueOnce(new Error('offline'))
  await vm.loadContact()
  expect(vm.contactError.value).toBe(true)
  await vm.loadContact()
  expect(vm.contactError.value).toBe(false)
  expect(vm.mobile.value).toBe('812345678')
})
it('多个非默认地址不随意选联系人，非法电话号码不回填', async () => {
  const vm = setup()
  m.list.mockResolvedValueOnce([{ mobile: '+66812345678' }, { mobile: '+84912345678' }])
  await vm.loadContact()
  expect(vm.mobile.value).toBe('')
  m.list.mockResolvedValueOnce([{ mobile: '123', isDefault: true }])
  await vm.loadContact()
  expect(vm.mobile.value).toBe('')
})
