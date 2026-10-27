import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ populated: false, failed: false }))
vi.mock('../composables/use-page', () => ({ usePickupPage: () => ({
  apiOk: ref(true),
  loading: ref(false),
  failed: ref(state.failed),
  needsLogin: ref(false),
  orderList: ref(state.populated ? [{ id: '101' }, { id: '102' }] : null),
  items: ref(state.populated ? ['101', '102'].map(id => ({ order: { id, isNeedLogistics: id === '102' }, goods: [], address: '' })) : []),
  refresh: vi.fn(),
  toIndexPage: vi.fn(),
}) }))
beforeEach(() => {
  state.populated = false
  state.failed = false
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  Object.assign(uni, { getLocale: () => 'zh-Hans', setLocale: vi.fn() })
})
afterEach(() => vi.unstubAllGlobals())
it('filters pickup and delivery orders without a carousel or manual refresh action', async () => {
  state.populated = true
  const { default: i18n } = await import('@/locale')
  const Pickup = (await import('../index.vue')).default
  const slot = defineComponent({ setup: (_, { slots }) => () => h('div', slots.default?.()) })
  const wrapper = mount(Pickup, { global: {
    plugins: [i18n],
    components: { 'z-paging': slot },
    stubs: { 'DoingOrderCard': true, 'wd-button': defineComponent({ setup: (_, { slots }) => () => h('button', slots.default?.()) }) },
  } })
  const cards = wrapper.findAllComponents({ name: 'DoingOrderCard' })
  expect(cards).toHaveLength(1)
  expect(cards.map(card => card.props('item').order.id)).toEqual(['101'])
  expect(cards.every(card => card.props('showQrcode'))).toBe(true)
  expect(wrapper.findAll('.order-list .px-32rpx')).toHaveLength(0)
  expect(wrapper.find('swiper').exists()).toBe(false)
  expect(wrapper.findAll('button')).toHaveLength(2)
  await wrapper.findAll('button')[1].trigger('click')
  expect(wrapper.findComponent({ name: 'DoingOrderCard' }).props('item').order.id).toBe('102')
  wrapper.unmount()
})
it('renders real translated pickup empty-state text instead of missing legacy keys', async () => {
  const { default: i18n, setLocale } = await import('@/locale')
  const Pickup = (await import('../index.vue')).default
  setLocale('zh-Hans')
  const slot = defineComponent({ setup: (_, { slots }) => () => h('div', slots.default?.()) })
  const wrapper = mount(Pickup, { global: { plugins: [i18n], components: { 'z-paging': slot } } })
  expect(wrapper.text()).toContain('暂无进行中的订单')
  expect(wrapper.text()).toContain('去下单')
  expect(wrapper.find('.wd-empty').exists()).toBe(true)
  expect(wrapper.findAll('wd-button').at(-1)!.attributes('custom-class')).toContain('!bg-[#169b50]')
  expect(wrapper.text()).not.toContain('order.empty')
  setLocale('en')
  await nextTick()
  expect(wrapper.text()).toContain('No orders in progress')
  wrapper.unmount()
})
it('uses existing Chinese pickup-card labels for the number, total and date', async () => {
  const { default: i18n, setLocale } = await import('@/locale')
  const Card = (await import('../components/DoingOrderCard/index.vue')).default
  setLocale('zh-Hans')
  const wrapper = mount(Card, { props: { showQrcode: false, item: {
    order: { id: '1', hxNumber: 'DEMO', qudanhao: 'A01', isNeedLogistics: false, amountReal: 12, dateAdd: '2026-10-24' },
    goods: [],
    address: '',
  } }, global: { plugins: [i18n] } })
  expect(wrapper.text()).toContain('取单号')
  expect(wrapper.text()).toContain('合计')
  expect(wrapper.text()).toContain('下单时间')
  expect(wrapper.text()).not.toContain('PickingUp.')
  wrapper.unmount()
})

it('shows an unavailable message without retry or order actions on failure', async () => {
  state.failed = true
  const { default: i18n, setLocale } = await import('@/locale')
  setLocale('zh-Hans')
  const Pickup = (await import('../index.vue')).default
  const wrapper = mount(Pickup, { global: { plugins: [i18n] } })
  expect(wrapper.text()).toContain('暂时无法获取取餐进度')
  expect(wrapper.text()).not.toContain('点击重试')
  expect(wrapper.text()).not.toContain('暂无进行中的订单')
  expect(wrapper.text()).not.toContain('去下单')
  wrapper.unmount()
})
