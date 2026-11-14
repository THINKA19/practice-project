import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { loadTencentMap } from '../adapters/tencent-loader'
import LocationMap from '../index.vue'

vi.mock('../adapters/tencent-loader', () => ({ loadTencentMap: vi.fn() }))

afterEach(() => {
  vi.resetAllMocks()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

it('腾讯 Web 缺少 Key 时显示状态，且不请求 SDK', () => {
  vi.stubEnv('VITE_TENCENT_MAP_JS_KEY', '')
  const wrapper = mount(LocationMap, { props: { provider: 'tencent', location: { latitude: 13.75, longitude: 100.5 } } })
  expect(wrapper.text()).toContain('腾讯地图暂未启用')
  expect(loadTencentMap).not.toHaveBeenCalled()
  expect(wrapper.find('iframe').exists()).toBe(false)
  wrapper.unmount()
})

it('腾讯 Web 加载失败可重试，切换服务商时清理地图和标记', async () => {
  vi.useFakeTimers()
  vi.stubEnv('VITE_TENCENT_MAP_JS_KEY', 'test-key')
  const map = { on: vi.fn(), setCenter: vi.fn(), setZoom: vi.fn(), destroy: vi.fn() }
  const layer = { setMap: vi.fn() }
  const Marker = vi.fn(() => layer)
  class LatLng {
    constructor(public latitude: number, public longitude: number) {}
  }
  vi.mocked(loadTencentMap).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({
    LatLng,
    Map: vi.fn(() => map),
    MultiMarker: Marker,
  })
  const location = { latitude: 13.75, longitude: 100.5 }
  const wrapper = mount(LocationMap, { props: { provider: 'tencent', location, countryCode: 'TH', coordinateType: 'wgs84' } })
  await flushPromises()
  expect(wrapper.text()).toContain('腾讯地图暂时无法显示')
  await wrapper.find('button').trigger('tap')
  await flushPromises()
  expect(Marker).toHaveBeenCalledWith({ map, geometries: [{ id: 'location', position: location }] })
  expect(map.on).toHaveBeenCalledWith('tilesloaded', expect.any(Function))
  const onReady = map.on.mock.calls[0][1] as () => void
  onReady()
  await wrapper.setProps({ provider: 'google' })
  expect(wrapper.find('iframe').exists()).toBe(true)
  expect(layer.setMap).toHaveBeenCalledWith(null)
  expect(map.destroy).toHaveBeenCalledOnce()
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
