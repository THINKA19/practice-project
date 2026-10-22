import { defineMock } from '@alova/mock'
import { describe, expect, it, vi } from 'vitest'
import { createFoo } from './generators'
import { registerMockModules } from './utils/register'
import { page } from './utils/response'
import { withFailure } from './utils/scenario'

const request = { headers: {}, query: {}, params: {}, data: undefined }

describe('mock 框架扩展契约', () => {
  it('工厂数据不会在请求之间共享修改', () => {
    const first = createFoo()
    first.name = 'changed'
    expect(createFoo().name).toBe('Mock 示例')
  })

  it('分页解析 URL 字符串、不修改原数组，越界页为空', () => {
    const items = [1, 2, 3]
    expect(page(items, { page: '2', pageSize: '2' }).data).toEqual({
      list: [3],
      total: 3,
      page: 2,
      pageSize: 2,
    })
    expect(page(items, { page: -1, pageSize: 'bad' }).data).toEqual({
      list: [1, 2, 3],
      total: 3,
      page: 1,
      pageSize: 10,
    })
    expect(page(items, { page: 10 }).data.list).toEqual([])
    expect(items).toEqual([1, 2, 3])
  })

  it('重复路由明确失败，不按模块顺序静默覆盖', () => {
    expect(() => registerMockModules({
      first: defineMock({ '/foo': () => null }),
      second: defineMock({ '[get]/foo': () => null }),
    })).toThrow('重复路由 [GET]/foo')
    expect(registerMockModules({
      get: defineMock({ '[GET]/foo': () => null }),
      post: defineMock({ '[POST]/foo': () => null }),
      disabled: defineMock({ '[GET]/foo': () => null }, false),
    })).toHaveLength(3)
  })

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
})
