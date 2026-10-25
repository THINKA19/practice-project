import { describe, expect, it } from 'vitest'
import { fail, ok, page } from '../response'

describe('response', () => {
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

  it('复用当前响应契约', () => {
    expect(ok(null)).toEqual({ code: 0, message: 'ok', data: null })
    expect(fail('bad').code).toBe(400)
  })
})
