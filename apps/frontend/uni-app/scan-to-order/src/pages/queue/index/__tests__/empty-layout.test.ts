import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ populated: false }))
vi.mock('../composables/use-page', () => ({ useQueuePage: () => ({
  list: ref(state.populated ? [{ id: 1, name: 'A' }] : []),
  mylist: ref([]),
  loading: ref(false),
  failed: ref(false),
  recordsFailed: ref(false),
  canViewRecords: ref(false),
  active: ref(false),
  taking: ref(false),
}) }))
vi.mock('@/pages/pickup1/index/composables', () => ({ useOrderDetailData: () => ({
  scenes: [],
  loading: ref(false),
  failed: ref(false),
  orderDetail: ref(state.populated ? { orderInfo: { id: '1' } } : null),
  paymentShow: ref(false),
  money: ref(0),
  orderId: ref(null),
}) }))
vi.mock('@/pages/pickup1/doing/composables', () => ({ useOrderDoingList: () => ({
  scenes: [],
  loading: ref(false),
  failed: ref(false),
  needsLogin: ref(false),
  apiOk: ref(true),
  orderList: ref(state.populated ? [{ id: '1' }] : []),
}) }))
beforeEach(() => {
  state.populated = false
  for (const name of ['definePage', 'onLoad', 'onShow', 'onHide'])
    vi.stubGlobal(name, vi.fn())
})
afterEach(() => vi.unstubAllGlobals())

it.each([
  ['queue', () => import('../index.vue')],
  ['detail', () => import('@/pages/pickup1/index/index.vue')],
  ['demo list', () => import('@/pages/pickup1/doing/index.vue')],
] as const)('%s only creates a scroller when data exists', async (_, load) => {
  const { default: i18n } = await import('@/locale')
  const Page = (await load()).default
  const options = { global: { plugins: [i18n], stubs: { 'z-paging': true, 'OrderPaymentPopup': true } } }
  const empty = mount(Page, options)
  expect(empty.find('.wd-empty').exists()).toBe(true)
  expect(empty.find('z-paging-stub').exists()).toBe(false)
  expect(empty.findComponent({ name: 'PageState' }).props('fill')).toBe(true)
  empty.unmount()
  state.populated = true
  const populated = mount(Page, options)
  expect(populated.find('z-paging-stub').exists()).toBe(true)
  populated.unmount()
})
