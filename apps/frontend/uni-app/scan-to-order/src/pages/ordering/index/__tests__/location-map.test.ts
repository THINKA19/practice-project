import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import LocationMap from '@/components/location-map/index.vue'

const props = {
  countryCode: 'TH',
  coordinateType: 'wgs84' as const,
  location: { latitude: 13.75, longitude: 100.5 },
  markers: [],
}

it('缺少坐标不渲染假地图，也不请求 Google iframe', () => {
  const wrapper = mount(LocationMap, { props: { ...props, location: null } })
  expect(wrapper.text()).toContain('暂无位置坐标')
  expect(wrapper.find('iframe').exists()).toBe(false)
  expect(wrapper.find('image').exists()).toBe(false)
  wrapper.unmount()
})

it('弹出导航选择时移除原生地图，避免覆盖底部面板', async () => {
  const wrapper = mount(LocationMap, { props, global: { stubs: { GoogleLocationMap: true } } })
  expect(wrapper.find('map').exists()).toBe(true)
  await wrapper.setProps({ suspended: true })
  expect(wrapper.find('map').exists()).toBe(false)
  await wrapper.setProps({ suspended: false })
  expect(wrapper.find('map').exists()).toBe(true)
  wrapper.unmount()
})

it('福记演示店提供胡志明市真实坐标并传入原生地图和标记', async () => {
  const { shops } = await import('../mock/fixtures/shop')
  const shop = shops.find(item => item.id === 1)!
  expect(shop).toMatchObject({ countryCode: 'VN', coordinateType: 'wgs84', latitude: 10.7767, longitude: 106.7032194 })
  const location = { latitude: shop.latitude!, longitude: shop.longitude! }
  const wrapper = mount(LocationMap, { props: { countryCode: shop.countryCode, coordinateType: shop.coordinateType, location, markers: [{ id: 0, ...location, iconPath: '/pin.png', width: 30, height: 40 }] }, global: { stubs: { GoogleLocationMap: true } } })
  expect(wrapper.text()).not.toContain('暂无位置坐标')
  expect(wrapper.find('map').attributes()).toMatchObject({ latitude: '10.7767', longitude: '106.7032194' })
  wrapper.unmount()
})
