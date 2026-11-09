import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import ShopCard from '../components/ShopCard/index.vue'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@dcloudio/uni-app', () => ({ onHide: vi.fn(), onShow: vi.fn() }))

it('点击门头预览本店相册，切换门店后使用新照片，不触发选店或导航', async () => {
  const previewImage = vi.fn()
  vi.stubGlobal('uni', { ...uni, previewImage })
  const wrapper = mount(ShopCard, { props: { shop: { id: 1, name: '门店', pic: '/cover.jpg', photos: ['/cover.jpg', '/inside.jpg'] }, nearest: false, selectText: '进入门店' }, global: { stubs: { 'wd-icon': true } } })
  try {
    vi.mocked(navigate).mockClear()
    await wrapper.find('image').trigger('tap')
    expect(previewImage).toHaveBeenLastCalledWith({ current: '/cover.jpg', urls: ['/cover.jpg', '/inside.jpg'] })
    await wrapper.setProps({ shop: { id: 2, name: '新门店', pic: '/new.jpg' } })
    await wrapper.find('image').trigger('tap')
    expect(previewImage).toHaveBeenLastCalledWith({ current: '/new.jpg', urls: ['/new.jpg'] })
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(navigate).not.toHaveBeenCalled()
  }
  finally {
    wrapper.unmount()
    vi.unstubAllGlobals()
  }
})

it('列表缺少坐标时仍可打开位置页加载详情，且不触发切换门店', async () => {
  const wrapper = mount(ShopCard, { props: { shop: { id: 100, name: '中心店', address: '示范路' }, nearest: false, selectText: '进入门店' }, global: { stubs: { 'wd-icon': true } } })
  const navigation = wrapper.findAll('button')[1]
  expect(navigation.attributes('disabled')).toBeUndefined()
  await navigation.trigger('tap')
  expect(navigate).toHaveBeenCalledWith(ClientRoutes.Ordering.shopLocation, { id: 100 })
  expect(wrapper.emitted('select')).toBeUndefined()
  wrapper.unmount()
})

it('当前门店显示文字并高亮卡片和按钮，最近门店不冒充选中门店', async () => {
  const wrapper = mount(ShopCard, { props: { shop: { id: 2, name: '公园店' }, nearest: false, selected: false, selectText: '进入门店' }, global: { stubs: { 'wd-icon': true } } })
  expect(wrapper.find('.select-btn-secondary').text()).toBe('进入门店')
  expect(wrapper.classes()).not.toContain('shop-card-selected')
  await wrapper.setProps({ selected: true })
  expect(wrapper.find('.select-btn-secondary').text()).toBe('进入门店')
  expect(wrapper.text()).toContain('当前门店')
  expect(wrapper.classes()).toContain('shop-card-selected')
  expect(wrapper.find('.select-btn-selected').exists()).toBe(true)
  await wrapper.setProps({ selected: false, nearest: true })
  expect(wrapper.text()).not.toContain('当前门店')
  expect(wrapper.find('.select-btn-secondary').text()).toBe('进入门店')
  expect(wrapper.classes()).not.toContain('shop-card-selected')
  expect(wrapper.find('.select-btn-selected').exists()).toBe(false)
  wrapper.unmount()
})

it('小图保留原尺寸居中，更换大图恢复填充，失败时使用占位', async () => {
  const wrapper = mount(ShopCard, { props: { shop: { id: 1, name: '福记饭店', pic: '/small.jpg' }, nearest: true, selectText: '进入门店' }, global: { stubs: { 'wd-icon': true } } })
  wrapper.find('image').element.dispatchEvent(new CustomEvent('load', { detail: { width: '40', height: '50' } }))
  await nextTick()
  expect(wrapper.find('image').attributes('style')).toContain('width: 40px')
  expect(wrapper.find('image').attributes('style')).toContain('height: 50px')
  await wrapper.setProps({ shop: { id: 1, name: '福记饭店', pic: '/large.jpg' } })
  expect(wrapper.find('image').attributes('style')).toContain('width: 100%')
  await wrapper.find('image').trigger('error')
  expect(wrapper.find('image').exists()).toBe(false)
  expect(wrapper.find('.shop-photo wd-icon-stub').exists()).toBe(true)
  wrapper.unmount()
})
