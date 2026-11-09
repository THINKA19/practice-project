/** 收藏分类的登录引导、空列表和加载失败使用不同操作。 */
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ShopSelectionPage from '../components/ShopSelectionPage/index.vue'

vi.mock('@/pages/ordering/menu', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
const vm = {
  paging: ref(),
  shops: ref([]),
  searchValue: ref(''),
  countryCode: ref(''),
  cityCode: ref(''),
  districtCode: ref(''),
  regionLabel: ref('地区'),
  category: ref('favorites'),
  favoritesNeedLogin: ref(true),
  emptyText: ref('当前筛选条件下暂无收藏门店'),
  regions: ref([]),
  regionsLoading: ref(false),
  regionsError: ref(''),
  regionsReady: ref(true),
  favorites: { error: '', load: vi.fn() },
  loginForFavorites: vi.fn(),
  changeCategory: vi.fn(),
  reload: vi.fn(),
  setVisible: vi.fn(),
  resetFilters: vi.fn(),
  restorePosition: vi.fn(),
}
vi.mock('../composables/use-select-page', () => ({ useShopSelectPage: () => vm }))
beforeEach(() => {
  vi.clearAllMocks()
  vm.favoritesNeedLogin.value = true
  for (const name of ['onLoad', 'onShow', 'onHide', 'onTabItemTap'])
    vi.stubGlobal(name, vi.fn())
})
afterEach(() => vi.unstubAllGlobals())
function render(failed = false) {
  return mount(ShopSelectionPage, { global: { stubs: {
    'z-paging': { template: `<view><slot name="top" /><slot name="empty" :isLoadFailed="${failed}" /><slot /></view>` },
    'wd-icon': true,
    'RegionPicker': true,
  } } })
}
it('未登录只展示登录按钮，点击按钮才发出登录动作', async () => {
  const wrapper = render()
  expect(wrapper.text()).toContain('登录后查看收藏门店')
  expect(wrapper.text()).not.toContain('当前筛选条件下暂无收藏门店')
  expect(vm.loginForFavorites).not.toHaveBeenCalled()
  await wrapper.find('.favorites-login').trigger('tap')
  expect(vm.loginForFavorites).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})
it('已登录空列表提供浏览全部，加载失败提供重试，不显示登录按钮', async () => {
  vm.favoritesNeedLogin.value = false
  const empty = render()
  expect(empty.text()).toContain('当前筛选条件下暂无收藏门店')
  await empty.find('button').trigger('tap')
  expect(vm.changeCategory).toHaveBeenCalledWith('all')
  empty.unmount()
  const failed = render(true)
  expect(failed.text()).toContain('加载失败')
  expect(failed.text()).not.toContain('当前筛选条件下暂无收藏门店')
  expect(failed.find('.favorites-login').exists()).toBe(false)
  await failed.find('button').trigger('tap')
  expect(vm.reload).toHaveBeenCalled()
  failed.unmount()
})

it('列表首次进入重置一次，从点餐页返回只恢复位置，不重置分页和筛选', async () => {
  let show!: () => void
  let hide!: () => void
  vi.stubGlobal('onShow', (callback: () => void) => {
    show = callback
  })
  vi.stubGlobal('onHide', (callback: () => void) => {
    hide = callback
  })
  const wrapper = render()
  show()
  await nextTick()
  expect(vm.resetFilters).toHaveBeenCalledTimes(1)
  vm.resetFilters.mockClear()
  vm.restorePosition.mockClear()
  hide()
  expect(vm.setVisible).toHaveBeenLastCalledWith(false)
  show()
  await nextTick()
  expect(vm.setVisible).toHaveBeenLastCalledWith(true)
  expect(vm.resetFilters).not.toHaveBeenCalled()
  expect(vm.reload).not.toHaveBeenCalled()
  expect(vm.restorePosition).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})
