import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { navigate } from '@/utils/project/navigation'
import { openLink } from '@/pages/ordering/menu'
import { ClientRoutes } from '@/pages/routes'
import { alert } from '@/utils/project/interaction'
import { useShopDetailPage } from '../composables/use-detail-page'
import { effectScope } from 'vue'

const api = vi.hoisted(() => ({ detail: vi.fn() }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn().mockResolvedValue({ ok: true }) }))
vi.mock('@/pages/ordering/index', async importOriginal => ({ ...await importOriginal<typeof import('@/pages/ordering/index')>(), shopApi: api }))
vi.mock('@/utils/project/interaction', () => ({ alert: vi.fn(), back: vi.fn(), makePhoneCall: vi.fn(), setTitle: vi.fn() }))
vi.mock('@/pages/ordering/menu', () => ({ openLink: vi.fn(), openLocation: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => vi.unstubAllEnvs())
it('有效门店坐标生成地图和真实存在的标记图标', async () => {
  api.detail.mockResolvedValue({ info: { id: 1, name: '门店', latitude: 22.5431, longitude: 114.0579, coordinateType: 'wgs84' } })
  const vm = useShopDetailPage()
  await vm.init({ id: '1' })
  expect(vm.mapUrl.value).toContain('https://www.google.com/maps?')
  expect(vm.mapUrl.value).toContain('q=22.5431%2C114.0579')
  expect(vm.markers.value[0].iconPath).toBe('/static/images/ordering/map-pin.png')
})
it.each([{}, { latitude: 91, longitude: 114 }, { latitude: 22, longitude: Number.NaN }])('缺失或非法坐标不生成误导性地图 %j', async (position) => {
  api.detail.mockResolvedValue({ info: { id: 1, name: '门店', ...position } })
  const vm = useShopDetailPage()
  await vm.init({ id: '1' })
  expect(vm.location.value).toBeNull()
  expect(vm.mapUrl.value).toBe('')
  expect(vm.markers.value).toEqual([])
})

it('导航入口先进入应用内地图页，不直接打开外部网址', async () => {
  api.detail.mockResolvedValue({ info: { id: 1, name: '门店', latitude: 22.5431, longitude: 114.0579 } })
  const vm = useShopDetailPage()
  await vm.init({ id: '1' })
  vm.guideNow()
  expect(navigate).toHaveBeenCalledWith(ClientRoutes.Ordering.shopLocation, { id: 1 })
  expect(openLink).not.toHaveBeenCalled()
})
it('开始导航使用 Google 路线链接，目的地使用 WGS84 坐标', async () => {
  api.detail.mockResolvedValue({ info: { id: 1, name: '中心店 & 咖啡', latitude: 22.5431, longitude: 114.0579, coordinateType: 'wgs84' } })
  const vm = useShopDetailPage()
  await vm.init({ id: '1' })
  vm.startNavigation()
  expect(openLink).toHaveBeenCalledWith('https://www.google.com/maps/dir/?api=1&destination=22.5431%2C114.0579&dir_action=navigate')
})

it('无坐标仍可进入位置页复制地址，但不能开始导航', async () => {
  api.detail.mockResolvedValue({ info: { id: 3, name: '无坐标门店', address: '示例路' } })
  const vm = useShopDetailPage()
  await vm.init({ id: '3' })
  vm.guideNow()
  expect(navigate).toHaveBeenCalledWith(ClientRoutes.Ordering.shopLocation, { id: 3 })
  vm.startNavigation()
  expect(openLink).not.toHaveBeenCalled()
  expect(alert).toHaveBeenCalledWith('门店暂未提供有效的位置坐标')
})

it('加载失败保留可重试状态，重试成功恢复门店', async () => {
  api.detail.mockRejectedValueOnce(new Error('网络暂不可用'))
  const vm = useShopDetailPage()
  await vm.init({ id: '1' })
  expect(vm.loading.value).toBe(false)
  expect(vm.error.value).toBe('网络暂不可用')
  api.detail.mockResolvedValueOnce({ info: { id: 1, name: '门店' } })
  await vm.init({ id: '1' })
  expect(vm.error.value).toBe('')
  expect(vm.shopInfo.value?.id).toBe(1)
})

it('相册去重并过滤非法数据，预览使用当前门店全部照片', async () => {
  const previewImage = vi.fn()
  vi.stubGlobal('uni', { previewImage })
  try {
    api.detail.mockResolvedValue({ info: { id: 1, name: '门店', pic: '/cover.jpg', photos: ['/cover.jpg', '/inside.jpg', null, ''], services: 'bad' } })
    const vm = useShopDetailPage()
    await vm.init({ id: '1' })
    expect(vm.photos.value).toEqual(['/cover.jpg', '/inside.jpg'])
    expect(vm.services.value).toEqual([])
    vm.previewPhoto('/inside.jpg')
    expect(previewImage).toHaveBeenCalledWith({ current: '/inside.jpg', urls: ['/cover.jpg', '/inside.jpg'] })
  }
  finally {
    vi.unstubAllGlobals()
  }
})

it('切换门店后迟到的旧请求不覆盖当前门店', async () => {
  let resolveOld!: (value: { info: { id: number, name: string } }) => void
  api.detail.mockImplementationOnce(() => new Promise((resolve) => {
    resolveOld = resolve
  }))
  api.detail.mockResolvedValueOnce({ info: { id: 2, name: '新门店' } })
  const vm = useShopDetailPage()
  const oldRequest = vm.init({ id: '1' })
  await vm.init({ id: '2' })
  resolveOld({ info: { id: 1, name: '旧门店' } })
  await oldRequest
  expect(vm.shopInfo.value?.id).toBe(2)
  expect(vm.loading.value).toBe(false)
})

it('无效入口清空上一家门店的全部快照与标记', async () => {
  api.detail.mockResolvedValue({ info: { id: 1, name: '门店', latitude: 22, longitude: 114 } })
  const vm = useShopDetailPage()
  await vm.init({ id: '1' })
  await vm.init({ id: '0' })
  expect(vm.shopInfo.value).toBeNull()
  expect(vm.detail.value).toBeNull()
  expect(vm.markers.value).toEqual([])
})

it('页面作用域销毁后不接收迟到快照或更新标题', async () => {
  let complete!: (value: { info: { id: number, name: string } }) => void
  api.detail.mockImplementationOnce(() => new Promise((resolve) => {
    complete = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(() => useShopDetailPage())!
  const pending = vm.init({ id: '1' })
  scope.stop()
  complete({ info: { id: 1, name: '旧页面门店' } })
  await pending
  expect(vm.shopInfo.value).toBeNull()
})
