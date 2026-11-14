import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import LocationMap from '@/components/location-map/index.vue'

const props = { countryCode: 'VN', coordinateType: 'wgs84' as const, location: { latitude: 10.7767, longitude: 106.7032194 } }
afterEach(() => vi.useRealTimers())

it('无 Key 时仍嵌入真实越南位置，不引用收费 API', () => {
  const wrapper = mount(LocationMap, { props })
  const frame = wrapper.find('iframe')
  const url = new URL(frame.attributes('src') || '')
  expect(url.origin).toBe('https://www.google.com')
  expect(url.searchParams.get('q')).toBe('10.7767,106.7032194')
  expect(url.searchParams.get('output')).toBe('embed')
  expect(url.searchParams.has('key')).toBe(false)
  expect(url.pathname).not.toContain('/embed/v1/')
  expect(wrapper.text()).not.toMatch(/尚未启用|暂未启用|高德|腾讯|百度/)
  wrapper.unmount()
})

it('无坐标按地址展示，切店更换 iframe，空目的地不发请求', async () => {
  const wrapper = mount(LocationMap, { props: { address: 'Nhà hát & Lam Sơn' } })
  const original = wrapper.find('iframe').element
  expect(new URL(wrapper.find('iframe').attributes('src') || '').searchParams.get('q')).toBe('Nhà hát & Lam Sơn')
  await wrapper.setProps(props)
  expect(wrapper.find('iframe').element).not.toBe(original)
  await wrapper.setProps({ location: null, address: '' })
  expect(wrapper.find('iframe').exists()).toBe(false)
  expect(wrapper.text()).toContain('暂无位置或地址')
  wrapper.unmount()
})

it('慢加载和错误允许重试，重试重建 iframe，卸载清除定时器', async () => {
  vi.useFakeTimers()
  const wrapper = mount(LocationMap, { props })
  await vi.advanceTimersByTimeAsync(20000)
  expect(wrapper.text()).toContain('地图加载较慢')
  const original = wrapper.find('iframe').element
  await wrapper.find('button').trigger('tap')
  expect(wrapper.find('iframe').element).not.toBe(original)
  await wrapper.find('iframe').trigger('load')
  expect(vi.getTimerCount()).toBe(0)
  await wrapper.find('iframe').trigger('error')
  expect(wrapper.text()).toContain('地图加载较慢')
  await wrapper.find('button').trigger('tap')
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
