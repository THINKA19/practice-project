import { afterEach, beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
})
afterEach(() => {
  document.head.querySelectorAll('script[src*="webapi.amap.com"]').forEach(script => script.remove())
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('未配置不发 SDK 请求，多个调用共享加载，回调完成后清理计时器', async () => {
  const { loadAmap } = await import('../adapters/amap-loader')
  await expect(loadAmap('', '')).rejects.toThrow('地图暂未启用')
  expect(document.head.querySelector('script[src*="webapi.amap.com"]')).toBeNull()
  const first = loadAmap('browser-key', 'security-code')
  expect(loadAmap('browser-key', 'security-code')).toBe(first)
  const script = document.head.querySelector<HTMLScriptElement>('script[src*="webapi.amap.com"]')!
  expect((window as unknown as Record<string, unknown>)._AMapSecurityConfig).toEqual({ securityJsCode: 'security-code' })
  const api = { Map: vi.fn(), Marker: vi.fn() }
  vi.stubGlobal('AMap', api)
  const callback = new URL(script.src).searchParams.get('callback')!
  ;((window as unknown as Record<string, () => void>)[callback])()
  await expect(first).resolves.toBe(api)
  expect(vi.getTimerCount()).toBe(0)
})

it('网络失败和超时清理加载状态，允许重新请求', async () => {
  const { loadAmap } = await import('../adapters/amap-loader')
  const failed = loadAmap('key', 'code')
  const assertion = expect(failed).rejects.toThrow('地图服务连接失败')
  document.head.querySelector('script[src*="webapi.amap.com"]')!.dispatchEvent(new Event('error'))
  await assertion
  expect(document.head.querySelector('script[src*="webapi.amap.com"]')).toBeNull()
  const retry = loadAmap('key', 'code')
  const timeout = expect(retry).rejects.toThrow('地图加载超时')
  await vi.advanceTimersByTimeAsync(20000)
  await timeout
  expect(vi.getTimerCount()).toBe(0)
})
