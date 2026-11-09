import { nextTick, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { openLink } from '@/pages/ordering/menu'
import * as vue from 'vue'
import ts from 'typescript'
import { initPreContext, preJs } from '@dcloudio/uni-cli-shared'
import * as mapLinks from '../../index/models/map-links'

const detail = vi.hoisted(() => ({ init: vi.fn(), create: vi.fn() }))

/** 用构建器的条件编译验证平台分支，避免 Vitest 同时执行 H5 与 MP 注释块。 */
function useShopLocationPage(platform = 'h5'): ReturnType<typeof import('../composables/use-page').useShopLocationPage> {
  initPreContext(platform)
  const source = preJs(readFileSync('src/pages/ordering/shop-location/composables/use-page.ts', 'utf8'), 'use-page.ts')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const output: Record<string, any> = {}
  const dependencies: Record<string, unknown> = {
    'vue': vue,
    '@/pages/ordering/shop-detail': { useShopDetailPage: detail.create },
    '@/pages/ordering/index': { ...mapLinks },
    '@/pages/ordering/menu': { openLink },
  }
  const requireDependency = (name: string) => {
    if (!(name in dependencies))
      throw new Error(`Unexpected dependency: ${name}`)
    return dependencies[name]
  }
  // 执行本仓库经官方预处理器编译后的模块，不执行外部脚本。
  runInNewContext(code, { require: requireDependency, exports: output, setTimeout, clearTimeout, get uni() {
    return Reflect.get(globalThis, 'uni')
  } })
  return output.useShopLocationPage()
}
vi.mock('@/pages/ordering/shop-detail', () => ({ useShopDetailPage: detail.create }))
vi.mock('@/pages/ordering/menu', () => ({ openLink: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  detail.create.mockReturnValue({ init: detail.init, shopInfo: ref(null) })
})

it.each(['', '0', '-1', 'abc', '1.5'])('无效门店编号 %s 清理详情状态，不传入有效查询编号', (id) => {
  const vm = useShopLocationPage()
  vm.init({ id })
  expect(vm.invalid.value).toBe(true)
  expect(detail.init).toHaveBeenCalledWith({})
})

it('有效门店编号读取当前门店，重新初始化清除无效状态', () => {
  const vm = useShopLocationPage()
  vm.init({ id: 'bad' })
  vm.init({ id: '12' })
  expect(vm.invalid.value).toBe(false)
  expect(detail.init).toHaveBeenCalledWith({ id: '12' })
})

it('只复制当前门店的有效地址，空地址不操作剪贴板', () => {
  const setClipboardData = vi.fn()
  vi.stubGlobal('uni', { setClipboardData })
  try {
    const shopInfo = ref<{ address?: string } | null>(null)
    detail.create.mockReturnValue({ init: detail.init, shopInfo })
    const vm = useShopLocationPage()
    vm.copyAddress()
    expect(setClipboardData).not.toHaveBeenCalled()
    shopInfo.value = { address: '门店地址' }
    vm.copyAddress()
    expect(setClipboardData).toHaveBeenCalledWith(expect.objectContaining({ data: '门店地址' }))
  }
  finally {
    vi.unstubAllGlobals()
  }
})

it.each(['desktop', 'android', 'ios'])('浏览器 %s 仅提供 Google，直接打开且不弹出地图选项', () => {
  detail.create.mockReturnValue({ init: detail.init, shopInfo: ref({ id: 1, name: '门店', address: 'Bangkok & Road' }), location: ref(null) })
  const vm = useShopLocationPage()
  expect(vm.navigationOptions.value.map(item => item.id)).toEqual(['google'])
  vm.startNavigation()
  expect(openLink).toHaveBeenCalledWith(expect.stringContaining('destination=Bangkok%20%26%20Road'))
  expect(vm.navigationVisible.value).toBe(false)
})
it('无地址和坐标时不显示导航选项', () => {
  const showActionSheet = vi.fn()
  vi.stubGlobal('uni', { showActionSheet })
  try {
    detail.create.mockReturnValue({ init: detail.init, shopInfo: ref({ id: 1, name: '门店' }) })
    const vm = useShopLocationPage()
    vm.startNavigation()
    expect(vm.navigationVisible.value).toBe(false)
    expect(showActionSheet).not.toHaveBeenCalled()
  }
  finally {
    vi.unstubAllGlobals()
  }
})

it('切换门店关闭旧选择面板，不打开旧目的地', async () => {
  vi.stubGlobal('uni', { getSystemInfoSync: () => ({ platform: 'android' }) })
  try {
    const shopInfo = ref({ id: 1, name: '第一家', address: 'Road A' })
    detail.create.mockReturnValue({ init: detail.init, shopInfo, location: ref(null) })
    const vm = useShopLocationPage('mp-weixin')
    vm.startNavigation()
    shopInfo.value = { id: 2, name: '第二家', address: 'Road B' }
    await nextTick()
    expect(vm.navigationVisible.value).toBe(false)
    vm.selectNavigation('google')
    expect(openLink).not.toHaveBeenCalled()
  }
  finally {
    vi.unstubAllGlobals()
  }
})

it('中文地区独立展示，复制当地地址后显示绿色提示的状态并自动清除', () => {
  vi.useFakeTimers()
  const setClipboardData = vi.fn(options => options.success())
  vi.stubGlobal('uni', { setClipboardData })
  try {
    detail.create.mockReturnValue({ init: detail.init, shopInfo: ref({ id: 1, countryName: '越南', cityName: '胡志明市', districtName: '第一郡', address: '1 Đường Đồng Khởi' }) })
    const vm = useShopLocationPage()
    expect(vm.regionAddress.value).toBe('越南 · 胡志明市 · 第一郡')
    vm.copyAddress()
    expect(setClipboardData).toHaveBeenCalledWith(expect.objectContaining({ data: '1 Đường Đồng Khởi', showToast: false }))
    expect(vm.addressCopied.value).toBe(true)
    vi.advanceTimersByTime(1500)
    expect(vm.addressCopied.value).toBe(false)
  }
  finally {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  }
})

it.each(['mp-weixin', 'mp-toutiao'])('%s 有越南坐标时保留内置地图和四种地图，外链仅复制', (platform) => {
  const nativeNavigation = vi.fn()
  const location = { latitude: 10.7767, longitude: 106.7032194 }
  detail.create.mockReturnValue({ init: detail.init, startNavigation: nativeNavigation, shopInfo: ref({ id: 1, name: '演示门店', ...location, countryCode: 'VN', coordinateType: 'wgs84' }), location: ref(location) })
  const vm = useShopLocationPage(platform)
  expect(vm.navigationOptions.value.map(item => item.id)).toEqual(['native', 'google', 'amap', 'tencent', 'baidu'])
  for (const option of vm.navigationOptions.value.filter(item => item.id !== 'native')) {
    expect(decodeURIComponent(option.url)).toContain(option.id === 'amap' ? '106.7032194,10.7767' : '10.7767,106.7032194')
  }
  vm.startNavigation()
  vm.selectNavigation('native')
  expect(nativeNavigation).toHaveBeenCalledOnce()
  expect(vm.navigationVisible.value).toBe(false)
  expect(openLink).not.toHaveBeenCalled()
  const setClipboardData = vi.fn()
  vi.stubGlobal('uni', { setClipboardData })
  try {
    vm.startNavigation()
    vm.selectNavigation('amap')
    expect(setClipboardData).toHaveBeenCalledWith(expect.objectContaining({ data: expect.stringContaining('https://uri.amap.com/navigation?') }))
    expect(openLink).not.toHaveBeenCalled()
    expect(vm.navigationVisible.value).toBe(false)
  }
  finally {
    vi.unstubAllGlobals()
  }
})
