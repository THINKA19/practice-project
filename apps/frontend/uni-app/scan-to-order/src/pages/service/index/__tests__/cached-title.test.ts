import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const lifecycle = vi.hoisted(() => ({ show: [] as (() => void)[], hide: [] as (() => void)[] }))
vi.mock('../composables/useActivityGallery', () => ({ useActivityGallery: () => ({ groups: ref([]), loading: ref(false), loadGallery: vi.fn() }) }))
vi.mock('@/components/contact-dock', () => ({ ContactDock: defineComponent({ render: () => h('div') }) }))
beforeEach(() => {
  lifecycle.show = []
  lifecycle.hide = []
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onShow', (fn: () => void) => lifecycle.show.push(fn))
  vi.stubGlobal('onHide', (fn: () => void) => lifecycle.hide.push(fn))
  Object.assign(uni, { setNavigationBarTitle: vi.fn() })
})
afterEach(() => vi.unstubAllGlobals())
it('does not let a hidden cached service page overwrite another page title on language change', async () => {
  const { default: i18n, setLocale } = await import('@/locale')
  setLocale('zh-Hans')
  const Service = (await import('../index.vue')).default
  const wrapper = mount(Service, { global: { plugins: [i18n], stubs: { 'z-paging': true } } })
  lifecycle.show.forEach(fn => fn())
  expect(uni.setNavigationBarTitle).toHaveBeenLastCalledWith({ title: '服务' })
  lifecycle.hide.forEach(fn => fn())
  vi.mocked(uni.setNavigationBarTitle).mockClear()
  setLocale('en')
  await nextTick()
  expect(uni.setNavigationBarTitle).not.toHaveBeenCalled()
  lifecycle.show.forEach(fn => fn())
  expect(uni.setNavigationBarTitle).toHaveBeenLastCalledWith({ title: 'Service' })
  wrapper.unmount()
})
