import { mount } from '@vue/test-utils'
import { effectScope, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { usePhoneContact } from '../use-phone-contact'
import PhoneDialog from '../PhoneDialog.vue'
import { alert, makePhoneCall } from '@/utils/project/interaction'

vi.mock('@/utils/project/interaction', () => ({ alert: vi.fn(), makePhoneCall: vi.fn() }))
const scopes: ReturnType<typeof effectScope>[] = []
function setup(value = ' +84 123456789 ') {
  const phone = ref(value)
  const scope = effectScope()
  scopes.push(scope)
  return { contact: scope.run(() => usePhoneContact(() => phone.value, () => '门店暂未提供联系电话'))!, phone }
}
beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  vi.stubGlobal('uni', { showToast: vi.fn(), makePhoneCall: vi.fn(), setClipboardData: vi.fn(), getSystemInfoSync: vi.fn(() => ({ platform: 'windows' })) })
})
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
it('打开只展示号码，不自动拨打或复制，缺少号码时明确提示', () => {
  const { contact } = setup()
  contact.open()
  expect(contact.phone.value).toBe('+84 123456789')
  expect(contact.visible.value).toBe(true)
  expect(uni.makePhoneCall).not.toHaveBeenCalled()
  expect(makePhoneCall).not.toHaveBeenCalled()
  expect(uni.setClipboardData).not.toHaveBeenCalled()
  contact.close()
  expect(contact.visible.value).toBe(false)
  const empty = setup('  ').contact
  empty.open()
  expect(alert).toHaveBeenCalledWith('门店暂未提供联系电话')
  expect(empty.visible.value).toBe(false)
})
it('复制成功给出反馈，复制失败保留号码并提示手动复制', () => {
  const { contact } = setup()
  contact.open()
  contact.copy()
  expect(uni.setClipboardData).toHaveBeenCalledWith(expect.objectContaining({ data: '+84 123456789', showToast: false }))
  const first = vi.mocked(uni.setClipboardData).mock.calls[0][0]
  first.success?.({ errMsg: 'ok' })
  expect(contact.copying.value).toBe(true)
  contact.copy()
  expect(uni.setClipboardData).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(299)
  expect(contact.copying.value).toBe(true)
  expect(contact.message.value).toBe('')
  vi.advanceTimersByTime(1)
  expect(contact.copying.value).toBe(true)
  expect(contact.message.value).toBe('')
  expect(contact.visible.value).toBe(false)
  expect(uni.showToast).not.toHaveBeenCalled()
  contact.copy()
  expect(uni.setClipboardData).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(299)
  expect(uni.showToast).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(contact.visible.value).toBe(false)
  expect(contact.copying.value).toBe(false)
  expect(contact.successVisible.value).toBe(true)
  vi.advanceTimersByTime(1500)
  expect(contact.successVisible.value).toBe(false)
  contact.open()
  contact.copy()
  const second = vi.mocked(uni.setClipboardData).mock.calls[1][0]
  second.fail?.({ errMsg: 'denied' })
  expect(contact.message.value).toContain('手动复制')
  expect(contact.phone.value).toBe('+84 123456789')
  expect(contact.visible.value).toBe(true)
})
it.each(['close', 'phone', 'dispose', 'success-close'])('复制成功后 %s 清理反馈和关闭任务，不影响重新打开的面板', (action) => {
  const { contact, phone } = setup()
  contact.open()
  contact.copy()
  vi.mocked(uni.setClipboardData).mock.calls[0][0].success?.({ errMsg: 'ok' })
  if (action === 'success-close')
    vi.advanceTimersByTime(300)
  expect(vi.getTimerCount()).toBe(1)
  if (action === 'close' || action === 'success-close')
    contact.close()
  else if (action === 'phone')
    phone.value = '+86 123456'
  else
    scopes[scopes.length - 1].stop()
  expect(vi.getTimerCount()).toBe(0)
  vi.advanceTimersByTime(1500)
  expect(uni.showToast).not.toHaveBeenCalled()
  if (action !== 'dispose') {
    contact.open()
    vi.advanceTimersByTime(1500)
    expect(contact.visible.value).toBe(true)
  }
})
it('关闭或更换号码后，迟到复制回调不污染下一次联系状态', () => {
  const { contact, phone } = setup()
  contact.open()
  contact.copy()
  const pending = vi.mocked(uni.setClipboardData).mock.calls[0][0]
  contact.close()
  contact.open()
  pending.fail?.({ errMsg: 'denied' })
  expect(contact.message.value).toBe('')
  phone.value = '+86 123456'
  expect(contact.visible.value).toBe(false)
  expect(contact.copying.value).toBe(false)
})
it('剪贴板 API 同步异常时保留手动复制入口', () => {
  const { contact } = setup()
  contact.open()
  vi.mocked(uni.setClipboardData).mockImplementation(() => {
    throw new Error('denied')
  })
  contact.copy()
  expect(contact.copying.value).toBe(false)
  expect(contact.message.value).toContain('手动复制')
})
it('面板号码允许手动选择，只保留复制与关闭操作', async () => {
  const wrapper = mount(PhoneDialog, {
    props: { modelValue: true, phone: '+84 123456789', message: '', copying: false, title: '联系门店', description: '请复制号码' },
    global: { stubs: { 'wd-popup': { template: '<div><slot /></div>' } } },
  })
  expect(wrapper.find('.phone-number').attributes('selectable')).toBeDefined()
  const buttons = wrapper.findAll('button')
  expect(buttons).toHaveLength(2)
  expect(wrapper.text()).not.toContain('拨打电话')
  await buttons[0].trigger('tap')
  expect(wrapper.emitted('copy')).toHaveLength(1)
  await wrapper.setProps({ copying: true })
  expect(buttons[0].text()).toBe('复制中…')
  expect(buttons[0].attributes('disabled')).toBeDefined()
  await wrapper.setProps({ copying: false })
  expect(wrapper.find('[role="status"]').exists()).toBe(false)
  expect(buttons[0].text()).toBe('复制号码')
  expect(wrapper.emitted('dial')).toBeUndefined()
  await buttons[1].trigger('tap')
  expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  wrapper.unmount()
})
it.each(['ios', 'android', 'windows'])('%s 非小程序端直接展示复制面板，不调用拨号', (platform) => {
  vi.mocked(uni.getSystemInfoSync).mockReturnValue({ platform } as ReturnType<typeof uni.getSystemInfoSync>)
  const { contact } = setup()
  contact.open()
  expect(contact.visible.value).toBe(true)
  expect(uni.makePhoneCall).not.toHaveBeenCalled()
  expect(makePhoneCall).not.toHaveBeenCalled()
  expect(uni.setClipboardData).not.toHaveBeenCalled()
  contact.copy()
  expect(uni.setClipboardData).toHaveBeenCalledWith(expect.objectContaining({ data: '+84 123456789', showToast: false }))
})

it('opens only the latest confirmed number and ignores a resolution after disposal', async () => {
  const { contact } = setup('')
  let finishFirst!: (phone: string) => void
  const first = contact.open(() => new Promise((resolve) => {
    finishFirst = resolve
  }))
  await contact.open(() => Promise.resolve('+84 222'))
  finishFirst('+84 111')
  await first
  expect(contact.phone.value).toBe('+84 222')
  expect(contact.visible.value).toBe(true)

  let finishLast!: (phone: string) => void
  const last = contact.open(() => new Promise((resolve) => {
    finishLast = resolve
  }))
  scopes.at(-1)!.stop()
  finishLast('+84 333')
  await last
  expect(contact.visible.value).toBe(false)
})
