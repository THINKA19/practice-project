import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Popup from '../components/ConsentHost/index.vue'
import { cancelPrivacyConsent, canUseCustomerData, enablePrivacyConsent, ensurePrivacyConsent, useAgreementPrivacyConsent } from '../composables/use-privacy-consent'

const lifecycle = vi.hoisted(() => ({ show: () => {}, hide: () => {}, unload: () => {} }))
vi.mock('@dcloudio/uni-app', () => ({
  onShow: (callback: () => void) => {
    lifecycle.show = callback
  },
  onHide: (callback: () => void) => {
    lifecycle.hide = callback
  },
  onUnload: (callback: () => void) => {
    lifecycle.unload = callback
  },
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/auth/session', () => ({ identityForPath: () => 'customer' }))

beforeEach(() => {
  cancelPrivacyConsent()
  vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/home/index/index' }] as ReturnType<typeof getCurrentPages>)
  enablePrivacyConsent()
})
afterEach(() => cancelPrivacyConsent())

function render(show = true) {
  const page = mount(Popup, {
    global: {
      stubs: {
        WdPopup: { name: 'WdPopup', props: ['modelValue', 'position', 'closeOnClickModal'], template: '<section><slot /></section>' },
      },
    },
  })
  if (show)
    lifecycle.show()
  return page
}

it('首次挂载即显示弹窗，不依赖已经发生的页面 onShow 再次触发', async () => {
  const page = render(false)
  await nextTick()
  expect(useAgreementPrivacyConsent().requested.value).toBe(true)
  expect(page.findComponent({ name: 'WdPopup' }).props('modelValue')).toBe(true)
  page.unmount()
})

it('底部弹窗禁止点击遮罩关闭，拒绝关闭弹窗但不导航', async () => {
  const page = render()
  await nextTick()
  expect(page.findComponent({ name: 'WdPopup' }).props('position')).toBe('bottom')
  expect(page.findComponent({ name: 'WdPopup' }).props('closeOnClickModal')).toBe(false)
  expect(useAgreementPrivacyConsent().requested.value).toBe(true)
  await page.find('.privacy-button--reject').trigger('tap')
  expect(useAgreementPrivacyConsent().requested.value).toBe(false)
  expect(canUseCustomerData()).toBe(false)
  expect(uni.navigateTo).not.toHaveBeenCalled()
  expect(uni.navigateBack).not.toHaveBeenCalled()
  page.unmount()
})

it('隐藏或卸载未选择的弹窗不记录拒绝，重新显示仍提示', async () => {
  const page = render()
  lifecycle.hide()
  lifecycle.unload()
  page.unmount()
  const next = render()
  await nextTick()
  expect(useAgreementPrivacyConsent().requested.value).toBe(true)
  expect(canUseCustomerData()).toBe(false)
  next.unmount()
})

it('查看政策全文时隐藏弹窗，返回原页面继续等待明确选择', async () => {
  const page = render()
  lifecycle.hide()
  vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/auth/agreement/privacy' }] as ReturnType<typeof getCurrentPages>)
  lifecycle.show()
  await nextTick()
  expect(page.findComponent({ name: 'WdPopup' }).props('modelValue')).toBe(false)
  vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/home/index/index' }] as ReturnType<typeof getCurrentPages>)
  lifecycle.show()
  await nextTick()
  expect(page.findComponent({ name: 'WdPopup' }).props('modelValue')).toBe(true)
  expect(canUseCustomerData()).toBe(false)
  page.unmount()
})

it('查看全文不记录选择，微信同意事件才开放资料', async () => {
  const page = render()
  await page.findAll('view').find(view => view.text() === 'auth.privacyConsent.read')!.trigger('tap')
  expect(uni.navigateTo).toHaveBeenCalledWith({ url: '/pages/auth/agreement/privacy' })
  expect(canUseCustomerData()).toBe(false)
  const task = ensurePrivacyConsent()
  await page.find('#privacy-consent-agree').trigger('agreeprivacyauthorization')
  expect(await task).toBe(true)
  expect(useAgreementPrivacyConsent().requested.value).toBe(false)
  page.unmount()
})

it('h5 正文使用可聚焦原生区域，滚轮保留默认滚动且不冒泡，按钮在区域外', () => {
  const page = render()
  const region = page.find('[role="region"]')
  expect(region.element.tagName).toBe('DIV')
  expect(region.attributes('tabindex')).toBe('0')
  expect(region.findAll('button')).toHaveLength(0)
  expect(region.text()).toContain('auth.privacyConsent.summary')
  const outerWheel = vi.fn()
  page.element.addEventListener('wheel', outerWheel)
  const wheel = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true })
  region.element.dispatchEvent(wheel)
  expect(wheel.defaultPrevented).toBe(false)
  expect(outerWheel).not.toHaveBeenCalled()
  page.unmount()
})
