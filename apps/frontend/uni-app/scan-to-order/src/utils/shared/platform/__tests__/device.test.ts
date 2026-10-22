import { afterEach, describe, expect, it, vi } from 'vitest'
import { getLocation, scanCode } from '../device'

afterEach(() => vi.unstubAllGlobals())
describe('设备能力的异步错误契约', () => {
  it('宿主缺少能力时返回 Unsupported', async () => {
    vi.stubGlobal('uni', {})
    await expect(scanCode()).rejects.toMatchObject({ reason: 'Unsupported' })
  })
  it('定位授权失败保留原始错误', async () => {
    const original = { errMsg: 'getLocation:fail auth deny' }
    vi.stubGlobal('uni', { getLocation: (options: UniApp.GetLocationOptions) => options.fail?.(original) })
    await expect(getLocation()).rejects.toMatchObject({ reason: 'Denied', original })
  })
  it('扫码主动取消可由统一反馈识别', async () => {
    vi.stubGlobal('uni', { scanCode: (options: UniApp.ScanCodeOptions) => options.fail?.({ errMsg: 'scanCode:fail cancel' }) })
    await expect(scanCode()).rejects.toMatchObject({ reason: 'Cancelled' })
  })
})
