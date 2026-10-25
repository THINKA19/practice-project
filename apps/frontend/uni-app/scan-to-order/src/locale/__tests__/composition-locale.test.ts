import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.mocked(uni.getStorageSync).mockReturnValue('zh-Hans')
  Object.assign(uni, { getLocale: vi.fn(() => 'en-US'), setLocale: vi.fn() })
})
it('keeps Vue, TS text and platform language aligned from saved Chinese through language switches', async () => {
  const { default: i18n, setLocale, t } = await import('../index')
  expect(uni.setLocale).toHaveBeenCalledWith('zh-Hans')
  const View = defineComponent({ setup() {
    const vueLocale = useI18n()
    return () => h('div', `${vueLocale.t('tabbar.service')}|${t('service.title')}|${t('service.groups.food')}`)
  } })
  const wrapper = mount(View, { global: { plugins: [i18n] } })
  expect(wrapper.text()).toBe('服务|服务|餐品展示')
  setLocale('en')
  await nextTick()
  expect(wrapper.text()).toBe('Service|Service|Food showcase')
  setLocale('zh-Hans')
  await nextTick()
  expect(wrapper.text()).toBe('服务|服务|餐品展示')
  wrapper.unmount()
})
