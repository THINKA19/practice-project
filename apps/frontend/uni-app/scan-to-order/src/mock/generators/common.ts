import type { PageResult } from '@/http/types'

/** query 值可能来自 URL 字符串；边界解析不影响业务 DTO。 */
export interface PaginationQuery {
  page?: unknown
  pageSize?: unknown
}

function positiveInteger(value: unknown, fallback: number): number {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  return typeof number === 'number' && Number.isSafeInteger(number) && number > 0
    ? number
    : fallback
}

/** 纯分页切片，不修改原列表；大于末页时返回空列表。 */
export function paginate<T>(items: readonly T[], query: PaginationQuery = {}): PageResult<T> {
  const page = positiveInteger(query.page, 1)
  const pageSize = positiveInteger(query.pageSize, 10)
  const start = (page - 1) * pageSize
  return {
    list: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  }
}
