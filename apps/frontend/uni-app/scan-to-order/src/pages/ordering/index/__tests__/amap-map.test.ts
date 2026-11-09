import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AmapLocationMap from '../components/AmapLocationMap/index.vue'
import { loadAmap } from '../adapters/amap-loader'

vi.mock('../adapters/amap-loader', () => ({ loadAmap: vi.fn() }))
const props = {
  shop: { id: 1, name: 'Bangkok', countryCode: 'TH', coordinateType: 'wgs84' as const },
  location: { latitude: 13.75, longitude: 100.5 },
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.stubEnv('VITE_AMAP_JS_KEY', 'key')
  vi.stubEnv('VITE_AMAP_SECURITY_JS_CODE', 'code')
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

it('未配置不请求地图 SDK，保留导航和复制提示', () => {
  vi.stubEnv('VITE_AMAP_JS_KEY', '')
  const wrapper = mount(AmapLocationMap, { props })
  expect(loadAmap).not.toHaveBeenCalled()
  expect(wrapper.text()).toContain('门店地图暂未启用')
  expect(wrapper.text()).toContain('导航到店')
  wrapper.unmount()
})

it('地图 SDK 加载失败可重试，海外坐标正确标记，超时和卸载销毁地图', async () => {
  const handlers: Record<string, () => void> = {}
  const map = { add: vi.fn(), on: vi.fn((event: string, callback: () => void) => {
    handlers[event] = callback
  }), destroy: vi.fn(), setZoomAndCenter: vi.fn() }
  const Map = vi.fn(() => map)
  const Marker = vi.fn()
  vi.mocked(loadAmap).mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ Map, Marker })
  const wrapper = mount(AmapLocationMap, { props })
  await flushPromises()
  expect(wrapper.text()).toContain('高德地图暂时无法显示')
  await wrapper.find('button').trigger('tap')
  await flushPromises()
  expect(Map).toHaveBeenCalledWith(expect.any(HTMLElement), expect.objectContaining({ center: [100.5, 13.75] }))
  expect(Marker).toHaveBeenCalledWith({ position: [100.5, 13.75], title: 'Bangkok' })
  handlers.complete()
  expect(vi.getTimerCount()).toBe(0)
  await wrapper.find('button').trigger('tap')
  expect(map.setZoomAndCenter).toHaveBeenCalledWith(16, [100.5, 13.75])
  await wrapper.setProps({ location: { latitude: 13.8, longitude: 100.6 } })
  await flushPromises()
  await vi.advanceTimersByTimeAsync(20000)
  expect(wrapper.text()).toContain('高德地图暂时无法显示')
  expect(map.destroy).toHaveBeenCalledTimes(2)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it('离开页面后迟到的 SDK 响应不创建地图', async () => {
  let resolve!: (api: Awaited<ReturnType<typeof loadAmap>>) => void
  vi.mocked(loadAmap).mockReturnValue(new Promise((done) => {
    resolve = done
  }))
  const wrapper = mount(AmapLocationMap, { props })
  await flushPromises()
  wrapper.unmount()
  const Map = vi.fn()
  resolve({ Map, Marker: vi.fn() })
  await flushPromises()
  expect(Map).not.toHaveBeenCalled()
})
