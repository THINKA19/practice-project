import { describe, expect, it, vi } from 'vitest'
import { withDelay, withFailure } from '../scenario'

const request = { headers: {}, query: {}, params: {}, data: undefined }
describe('scenario', () => {
  it('确定失败不执行 handler，默认成功不消耗随机数', () => {
    const handler = vi.fn(() => 'ok')
    const random = vi.fn(() => 0)
    expect(() => withFailure(handler, { rate: 1 })(request)).toThrow('模拟请求失败')
    expect(handler).not.toHaveBeenCalled()
    expect(withFailure(handler, { rate: 0, random })(request)).toBe('ok')
    expect(random).not.toHaveBeenCalled()
  })

  it('概率分支可复现，异步 handler 的返回值被保留', async () => {
    const random = vi.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.9)
    const handler = withFailure(async () => 'ok', { rate: 0.5, random })
    expect(() => handler(request)).toThrow('模拟请求失败')
    await expect(handler(request)).resolves.toBe('ok')
  })

  it.each([-1, 2, Number.NaN])('拒绝非法失败概率 %s', (rate) => {
    expect(() => withFailure(() => null, { rate })).toThrow(RangeError)
  })
  it('随机失败不影响写操作，固定故障不执行写入', () => {
    const handler = vi.fn(() => 'ok')
    expect(withFailure(handler, { rate: 1, write: true })(request)).toBe('ok')
    expect(() => withFailure(handler, { scene: 'error', write: true })(request)).toThrow()
    expect(handler).toHaveBeenCalledOnce()
  })
  it('固定延迟只执行一次', async () => {
    const handler = vi.fn(() => 'ok')
    expect(await withDelay(handler, 0)(request)).toBe('ok')
    expect(handler).toHaveBeenCalledOnce()
  })
})
