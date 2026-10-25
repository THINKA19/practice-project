/**
 * ============================================================================
 * 【文件概述】复用现有 HTTP 响应契约，提供响应和分页工具。
 * 【方法与导出清单】ok、fail、page、PaginationQuery、paginate。
 * 【综合使用示例】
 * import { ok } from '@/mock/response'
 * ============================================================================
 */
import type { IResponse, PageResult } from '@/http/types'
import { ResultEnum } from '@/http/tools/enum'

/**
 * 创建当前请求链的成功信封。
 * @param data 响应负载，类型由调用接口 DTO 决定。
 * @param message 业务提示文本。
 * @returns IResponse<T>，code 使用请求层成功码，data 保持原负载。
 * @example ok(null) // { code: 0, message: 'ok', data: null }
 */
export function ok<T>(data: T, message = 'ok'): IResponse<T> {
  return { code: ResultEnum.Success0, message, data }
}

/**
 * 创建当前请求链的失败信封。
 * @param message 业务提示文本。
 * @param code 来自请求层契约的业务码。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example fail('失败') // 当前请求协议的失败信封
 */
export function fail(message: string, code: number = ResultEnum.Error): IResponse<null> {
  return { code, message, data: null }
}

/**
 * 将完整列表切片并创建分页信封。
 * @param items 当前请求的新对象列表，尚未分页。
 * @param query 原始分页参数，非法值使用默认值。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example page([1, 2], { page: 1, pageSize: 1 }).data // 第一项及 total=2
 */
export function page<T>(items: readonly T[], query: PaginationQuery = {}): IResponse<PageResult<T>> {
  return ok(paginate(items, query))
}

/**
 * 原始分页参数；URL 字符串由分页边界解析，缺省或非法值使用默认值。
 * @example const query: PaginationQuery = { page: '1', pageSize: '10' }
 */
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

/**
 * 解析分页参数并切片，不修改原列表。
 * @param items 当前请求的新对象列表，尚未分页。
 * @param query 原始分页参数，非法值使用默认值。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example paginate([1, 2], { page: 2, pageSize: 1 }).list // [2]
 */
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
