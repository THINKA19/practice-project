/** 分页响应结构；具体记录字段由业务解析器校验。 */
export interface PagedResult<T> { list: T[], totalPage?: number, totalRow?: number }

/** 校验响应为普通对象，拒绝数组与空值。 */
export function responseRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('数据格式错误')
  return value as Record<string, unknown>
}

/** 兼容数组、list/result 分页；记录转换及业务字段约束由 parseRow 提供。 */
export function parsePagedResponse<T>(value: unknown, parseRow: (row: Record<string, unknown>) => T): PagedResult<T> {
  if (value === null)
    return { list: [] }
  const data = Array.isArray(value) ? { list: value } : responseRecord(value)
  const rows = data.list ?? data.result
  if (!Array.isArray(rows))
    throw new Error('列表格式错误')
  const totalRow = data.totalRow ?? data.total
  for (const total of [totalRow, data.totalPage]) {
    if (total !== undefined && (typeof total !== 'number' || !Number.isSafeInteger(total) || total < 0))
      throw new Error('分页格式错误')
  }
  return { list: rows.map(row => parseRow(responseRecord(row))), totalRow: totalRow as number | undefined, totalPage: data.totalPage as number | undefined }
}

/** 开发数据分页切片；无效页码或每页数量直接报错。 */
export function slicePage<T>(rows: T[], query: unknown) {
  const params = query && typeof query === 'object' ? query as Record<string, unknown> : {}
  const page = Number(params.page ?? 1)
  const pageSize = Number(params.pageSize ?? 20)
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 500)
    throw new Error('分页参数无效')
  return { list: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, totalPage: Math.ceil(rows.length / pageSize) }
}
