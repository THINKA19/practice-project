import type { IResponse, PageResult } from '@/http/types'
import { ResultEnum } from '@/http/tools/enum'
import type { PaginationQuery } from '../generators/common'
import { paginate } from '../generators/common'

/** 与现有 Alova responded 使用相同的响应信封。 */
export function ok<T>(data: T, message = 'ok'): IResponse<T> {
  return { code: ResultEnum.Success0, message, data }
}

export function fail(message: string, code: number = ResultEnum.Error): IResponse<null> {
  return { code, message, data: null }
}

/** 输入完整列表，在同一处切片和计算 total，避免分页信息不一致。 */
export function page<T>(items: readonly T[], query: PaginationQuery = {}): IResponse<PageResult<T>> {
  return ok(paginate(items, query))
}
