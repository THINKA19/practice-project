import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'

const actions = vi.hoisted(() => ({ copyAddress: vi.fn(), startNavigation: vi.fn() }))
vi.mock('../composables/use-page', () => ({
  useShopLocationPage: () => ({
    shopInfo: ref({ id: 1, name: 'Bangkok Shop', address: 'Bangkok Road', arrivalGuide: '旧指引', parkingInfo: '旧停车', photos: ['/shop.jpg'] }),
    location: ref(null),
    markers: ref([]),
    mapUrl: ref(''),
    invalid: ref(false),
    loading: ref(false),
    error: ref(''),
    navigationUrl: ref('https://maps.example'),
    navigationVisible: ref(false),
    navigationOptions: ref([]),
    closeNavigation: vi.fn(),
    ...actions,
  }),
}))
vi.mock('@/components/location-map/index.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/page-state', () => ({ PageState: { template: '<div />' } }))
afterEach(() => vi.unstubAllGlobals())

it('位置页只保留地址旁复制、地图和导航主按钮，旧指引和照片不占用页面', async () => {
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onHide', vi.fn())
  vi.stubGlobal('ref', ref)
  const Page = (await import('../index.vue')).default
  const wrapper = shallowMount(Page, { global: { stubs: {
    WdPopup: { name: 'PopupStub', props: { modelValue: Boolean, position: String, rootPortal: Boolean, zIndex: Number }, template: '<div v-if="modelValue"><slot /></div>' },
  } } })
  expect(wrapper.text()).toContain('Bangkok Road')
  expect(wrapper.find('.copy-address').text()).toBe('复制地址')
  expect(wrapper.findComponent({ name: 'PopupStub' }).props()).toMatchObject({ position: 'bottom', rootPortal: true, zIndex: 1300 })
  expect(wrapper.text()).not.toMatch(/旧指引|旧停车|查看门店照片|复制 Google/)
  expect(wrapper.findAll('button')).toHaveLength(2)
  await wrapper.find('.copy-address').trigger('tap')
  expect(actions.copyAddress).toHaveBeenCalledOnce()
  await wrapper.find('.start-navigation').trigger('tap')
  expect(actions.startNavigation).toHaveBeenCalledOnce()
  wrapper.unmount()
})
