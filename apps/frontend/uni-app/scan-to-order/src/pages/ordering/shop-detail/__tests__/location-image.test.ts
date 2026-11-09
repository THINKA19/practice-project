import { mount } from '@vue/test-utils'
import { ref, watch } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Shop } from '@/pages/ordering/index'

const state = vi.hoisted(() => ({ create: vi.fn(), navigate: vi.fn() }))
vi.mock('../composables/use-detail-page', () => ({ useShopDetailPage: state.create }))
vi.mock('@/pages/ordering/menu', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/ordering/index', () => ({ ShopPhoneDialog: { template: '<div />' }, ShopFavorite: { template: '<view />' }, ShopLabels: { template: '<view />' }, ShopBusinessBadge: { template: '<text />' } }))
beforeEach(() => {
  for (const name of ['definePage', 'onShow', 'onHide', 'onLoad'])
    vi.stubGlobal(name, vi.fn())
  vi.stubGlobal('ref', ref)
  vi.stubGlobal('watch', watch)
})
afterEach(() => vi.unstubAllGlobals())
async function page(shop: Shop) {
  const shopInfo = ref(shop)
  state.create.mockReturnValue({ shopInfo, photos: ref(['/shop.jpg']), services: ref([]), introductionExpanded: ref(false), loading: ref(false), error: ref(''), guideNow: state.navigate, phoneContact: { successVisible: ref(false), copyFallbackAvailable: ref(false), visible: ref(false), phone: ref(''), message: ref(''), copying: ref(false) } })
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { stubs: { WdOverlay: { template: '<div><slot /></div>' }, ShopPhotoGallery: true } } })
  return { wrapper, shopInfo }
}
it('位置区域展示图片并进入位置页，不重复显示地址；失败及缺图有提示', async () => {
  const { wrapper, shopInfo } = await page({ id: 1, name: '店铺', address: '示范路 1 号', mapPreview: '/map.png' })
  const section = wrapper.find('.map-section')
  expect(section.text()).not.toContain('示范路')
  expect(section.find('image').attributes('src')).toBe('/map.png')
  await section.find('image').trigger('tap')
  expect(wrapper.find('.image-preview image').attributes('src')).toBe('/map.png')
  expect(wrapper.findComponent({ name: 'ShopPhotoGallery' }).props('active')).toBe(false)
  await wrapper.find('[aria-label="关闭预览"]').trigger('tap')
  expect(wrapper.findComponent({ name: 'ShopPhotoGallery' }).props('active')).toBe(true)
  await section.find('.map-tip').trigger('tap')
  expect(state.navigate).toHaveBeenCalledTimes(1)
  expect(section.text()).toContain('点击导航')
  await section.find('image').trigger('error')
  expect(section.text()).toContain('位置图片加载失败')
  shopInfo.value = { id: 2, name: '另一家店铺' }
  await wrapper.vm.$nextTick()
  expect(section.text()).toContain('门店暂未上传位置图片')
  expect(wrapper.text()).toContain('门店暂未提供地址')
  wrapper.unmount()
})
