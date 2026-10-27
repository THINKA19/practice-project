import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import { ORDER_TABS } from '../models/enums'

const state = vi.hoisted(() => ({ ready: true, guest: false }))

vi.mock('../composables/use-list-page', () => ({
  useOrderListPage: () => ({
    apiOk: ref(state.ready),
    needsLogin: ref(state.guest),
    loading: ref(false),
    failed: ref(false),
    cards: ref([]),
    activeTab: ref('all'),
    tabs: ORDER_TABS,
    refresh: vi.fn(),
    toIndexPage: vi.fn(),
  }),
}))
afterEach(() => vi.unstubAllGlobals())

it('顶部分类切换选中样式，空列表显示点餐入口且不显示图标和失败提示', async () => {
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { stubs: {
    'z-paging': { template: '<div><header><slot name="top" /></header><main><slot /></main><footer><slot name="bottom" /></footer></div>' },
    'wd-button': { template: '<button><slot /></button>' },
  } } })
  try {
    const tabs = wrapper.findAll('header .order-tab')
    expect(tabs).toHaveLength(5)
    expect(tabs[0].classes()).toContain('order-tab-active')
    expect(wrapper.find('footer').text()).toBe('')
    await tabs[2].trigger('tap')
    expect(tabs[0].classes()).not.toContain('order-tab-active')
    expect(tabs[2].classes()).toContain('order-tab-active')
    expect(wrapper.text()).toContain('当前分类暂无订单')
    expect(wrapper.text()).toContain('去点餐')
    expect(wrapper.text()).not.toContain('加载失败')
    expect(wrapper.find('wd-icon').exists()).toBe(false)
  }
  finally { wrapper.unmount() }
})

it('首次请求未完成时不显示无订单提示', async () => {
  state.ready = false
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { stubs: { 'z-paging': { template: '<div><slot /></div>' } } } })
  expect(wrapper.text()).not.toContain('还没有订单')
  expect(wrapper.text()).not.toContain('去点餐')
  wrapper.unmount()
  state.ready = true
})

it('未登录时仅显示登录入口', async () => {
  state.guest = true
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { stubs: { 'z-paging': { template: '<div><slot /></div>' } } } })
  expect(wrapper.text()).toContain('登录后查看订单')
  expect(wrapper.text()).not.toContain('还没有订单')
  wrapper.unmount()
  state.guest = false
})
