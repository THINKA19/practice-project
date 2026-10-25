import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { setLocale } from '@/locale'
import { setTabbarItem } from './i18n'
import Tabbar from './index.vue'

const lifecycle = vi.hoisted(() => ({ show: [] as (() => void)[], hide: [] as (() => void)[] }))

vi.mock('@/locale', async () => {
  const currentLocale = (await import('vue')).ref('zh-Hans')
  return {
    currentLocale,
    setLocale: (locale: string) => {
      currentLocale.value = locale
    },
  }
})
vi.mock('./i18n', () => ({ setTabbarItem: vi.fn() }))
vi.mock('./store', () => ({ tabbarList: { value: [] }, tabbarStore: { curIdx: 0 } }))

beforeEach(() => {
  lifecycle.show = []
  lifecycle.hide = []
  setLocale('zh-Hans')
  vi.stubGlobal('onShow', (fn: () => void) => lifecycle.show.push(fn))
  vi.stubGlobal('onHide', (fn: () => void) => lifecycle.hide.push(fn))
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onMounted', vi.fn())
})

afterEach(() => vi.unstubAllGlobals())

it('refreshes on show and language changes, skips hidden pages, and disposes its watcher', async () => {
  const wrapper = mount(Tabbar)
  try {
    setLocale('en')
    await nextTick()
    expect(setTabbarItem).not.toHaveBeenCalled()

    lifecycle.show.forEach(fn => fn())
    expect(setTabbarItem).toHaveBeenCalledTimes(1)

    setLocale('vi')
    await nextTick()
    expect(setTabbarItem).toHaveBeenCalledTimes(2)

    lifecycle.hide.forEach(fn => fn())
    setLocale('zh-Hans')
    await nextTick()
    expect(setTabbarItem).toHaveBeenCalledTimes(2)

    lifecycle.show.forEach(fn => fn())
    expect(setTabbarItem).toHaveBeenCalledTimes(3)
  }
  finally {
    wrapper.unmount()
  }
  setLocale('en')
  await nextTick()
  expect(setTabbarItem).toHaveBeenCalledTimes(3)
})
