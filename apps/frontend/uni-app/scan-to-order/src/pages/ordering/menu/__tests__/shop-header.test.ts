/** 门店卡片的模式、详情入口与可靠距离展示回归。 */
import { beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ShopHeader from '../components/ShopHeader/index.vue'

const m = vi.hoisted(() => ({ location: vi.fn() }))
vi.mock('../adapters/platform.adapter', () => ({ getLocation: m.location }))
vi.mock('@/pages/ordering/index', async () => ({
  distanceLine: (await import('../../index/domain/shop.rules')).distanceLine,
  convertShopPoint: (await import('../../index/models/coordinates')).convertShopPoint,
  ShopFavorite: { template: '<view>收藏</view>' },
  ShopLabels: { template: '<view />' },
  ShopBusinessBadge: { template: '<text />' },
}))
const shop = { id: 1, name: '福记饭店', latitude: 0, longitude: 0, coordinateType: 'wgs84' as const, distance: 0.8 }
beforeEach(() => {
  m.location.mockReset()
})
it('自取、配送标签随当前方式更新，只有详情按钮发出详情事件', async () => {
  m.location.mockRejectedValue(new Error('denied'))
  const wrapper = mount(ShopHeader, { props: { shop, deliveryType: 'zq' } })
  await flushPromises()
  expect(wrapper.text()).toContain('到店自取')
  await wrapper.find('.shop-name').trigger('tap')
  expect(wrapper.emitted('detail')).toBeUndefined()
  await wrapper.find('button').trigger('tap')
  expect(wrapper.emitted('detail')).toHaveLength(1)
  await wrapper.setProps({ deliveryType: 'kd' })
  expect(wrapper.text()).toContain('外卖配送')
  wrapper.unmount()
})
it('堂食展示桌号和详情，不发起定位请求', () => {
  const wrapper = mount(ShopHeader, { props: { shop, dineIn: true, tableCode: 'A08' } })
  expect(wrapper.text()).toContain('堂食')
  expect(wrapper.text()).toContain('桌号 A08')
  expect(wrapper.text()).not.toContain('km')
  expect(wrapper.find('button').exists()).toBe(true)
  expect(m.location).not.toHaveBeenCalled()
  wrapper.unmount()
})
it('门店缺坐标时隐藏旧列表距离，也不请求定位', () => {
  const wrapper = mount(ShopHeader, { props: { shop: { id: 1, name: '门店', distance: 0.8 } } })
  expect(wrapper.text()).not.toContain('0.8')
  expect(wrapper.text()).not.toContain('km')
  expect(m.location).not.toHaveBeenCalled()
  wrapper.unmount()
})
it('定位拒绝、失败或无效时隐藏距离，不伪造零公里，不重复请求', async () => {
  m.location.mockRejectedValueOnce(new Error('denied'))
  const wrapper = mount(ShopHeader, { props: { shop } })
  await flushPromises()
  await wrapper.setProps({ shop: { ...shop, latitude: 1 } })
  expect(wrapper.text()).not.toContain('km')
  expect(m.location).toHaveBeenCalledTimes(1)
  wrapper.unmount()
  m.location.mockResolvedValueOnce({ latitude: Number.NaN, longitude: 0 })
  const invalid = mount(ShopHeader, { props: { shop } })
  await flushPromises()
  expect(invalid.text()).not.toContain('km')
  invalid.unmount()
})
it('有效的零坐标不会被判缺失，近距离显示不足100米', async () => {
  m.location.mockResolvedValueOnce({ latitude: 0, longitude: 0 })
  const wrapper = mount(ShopHeader, { props: { shop } })
  await flushPromises()
  expect(wrapper.text()).toContain('直线距离不足 100 m')
  wrapper.unmount()
})
it('用本次定位计算直线距离，不沿用样本距离；切换堂食后不展示距离', async () => {
  m.location.mockResolvedValueOnce({ latitude: 0.01, longitude: 0 })
  const wrapper = mount(ShopHeader, { props: { shop } })
  await flushPromises()
  expect(wrapper.text()).toContain('直线距离约 1.1 km')
  expect(wrapper.text()).not.toContain('0.8')
  await wrapper.setProps({ dineIn: true })
  expect(wrapper.text()).toContain('已绑定当前桌台')
  expect(wrapper.text()).not.toContain('km')
  wrapper.unmount()
})
