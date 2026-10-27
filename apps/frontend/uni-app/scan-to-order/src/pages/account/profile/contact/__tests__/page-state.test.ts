import { effectScope } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useContactConfig } from '../composables/use-config'
import { contactApi } from '../composables/use-requests'
import { parseServiceConfig } from '../models/mappers'
import { confirm, toast } from '@/utils/project/interaction'

vi.mock('../composables/use-requests', () => ({ contactApi: { config: vi.fn() } }))
vi.mock('@/utils/project/interaction', () => ({ confirm: vi.fn(), toast: vi.fn(), showError: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('uni', { ...uni, setClipboardData: vi.fn(), previewImage: vi.fn(), makePhoneCall: vi.fn() })
})
afterEach(() => vi.unstubAllGlobals())
const sample = () => parseServiceConfig({ phone: '13800000000', channels: [{ kind: 'wechat', account: 'demo', qr_image: '/static/demo.png' }] })

it('刷新失败保留上次配置，二维码失败可重试，复制与预览使用当前配置', async () => {
  vi.mocked(contactApi.config).mockResolvedValueOnce(sample()).mockRejectedValueOnce(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(useContactConfig)!
  try {
    await vm.load()
    const item = vm.serviceData.value.channels[0]
    vm.copy(item.account)
    expect(uni.setClipboardData).toHaveBeenCalledWith(expect.objectContaining({ data: 'demo' }))
    vm.previewQr(item)
    expect(uni.previewImage).toHaveBeenCalledWith(expect.objectContaining({ urls: ['/static/demo.png'] }))
    vm.markQrFailed(item.id)
    expect(vm.qrErrors.value[item.id]).toBe(true)
    vm.retryQr(item.id)
    expect(vm.qrErrors.value[item.id]).toBeUndefined()
    await vm.load()
    expect(vm.failed.value).toBe(true)
    expect(vm.loaded.value).toBe(true)
    expect(vm.serviceData.value.channels[0]).toEqual(item)
    vm.copy('')
    expect(toast).toHaveBeenCalledWith('暂无联系方式')
  }
  finally { scope.stop() }
})
it('并发请求只采用最新配置，销毁后迟到响应不能更新页面', async () => {
  let finish!: (data: ReturnType<typeof sample>) => void
  vi.mocked(contactApi.config).mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  })).mockResolvedValueOnce(parseServiceConfig({}))
  const scope = effectScope()
  const vm = scope.run(useContactConfig)!
  const old = vm.load()
  await vm.load()
  finish(sample())
  await old
  expect(vm.serviceData.value.channels).toEqual([])
  vi.mocked(contactApi.config).mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const pending = vm.load()
  scope.stop()
  finish(sample())
  await pending
  expect(vm.serviceData.value.channels).toEqual([])
})
it('拨号需确认，离开页面后确认结果不能继续拨号', async () => {
  vi.mocked(contactApi.config).mockResolvedValue(sample())
  const scope = effectScope()
  const vm = scope.run(useContactConfig)!
  await vm.load()
  vi.mocked(confirm).mockResolvedValueOnce(true)
  await vm.showTelTips()
  expect(uni.makePhoneCall).toHaveBeenCalledTimes(1)
  let finish!: (value: boolean) => void
  vi.mocked(confirm).mockImplementationOnce(() => new Promise((resolve) => {
    finish = resolve
  }))
  const pending = vm.showTelTips()
  scope.stop()
  finish(true)
  await pending
  expect(uni.makePhoneCall).toHaveBeenCalledTimes(1)
})

it('推荐渠道首次展开，用户收起后刷新不重新展开，已隐藏渠道不残留', async () => {
  const data = parseServiceConfig({ channels: [{ id: 'wx', kind: 'wechat', account: 'wx' }, { id: 'fb', kind: 'facebook', account: 'fb', primary: true }] })
  vi.mocked(contactApi.config).mockResolvedValue(data)
  const scope = effectScope()
  const vm = scope.run(useContactConfig)!
  try {
    await vm.load()
    expect(vm.isExpanded(data.channels[1].id)).toBe(true)
    expect(vm.isExpanded(data.channels[0].id)).toBe(false)
    vm.toggleChannel(data.channels[1].id)
    await vm.load()
    expect(vm.expandedIds.value).toEqual([])
    vi.mocked(contactApi.config).mockResolvedValueOnce(parseServiceConfig({}))
    await vm.load()
    expect(vm.expandedIds.value).toEqual([])
  }
  finally { scope.stop() }
})
it('真实链接在 H5 打开，演示及非法链接不得跳转', async () => {
  const opener = vi.spyOn(window, 'open').mockReturnValue(null)
  vi.mocked(contactApi.config).mockResolvedValueOnce(sample()).mockResolvedValueOnce({ ...sample(), demo: true })
  const scope = effectScope()
  const vm = scope.run(useContactConfig)!
  try {
    await vm.load()
    vm.openLink('https://x.com/brand')
    expect(opener).toHaveBeenCalledWith('https://x.com/brand', '_blank', 'noopener,noreferrer')
    vm.openLink('javascript:alert(1)')
    expect(opener).toHaveBeenCalledTimes(1)
    await vm.load()
    vm.openLink('https://example.invalid/demo')
    expect(opener).toHaveBeenCalledTimes(1)
  }
  finally {
    scope.stop()
    opener.mockRestore()
  }
})
