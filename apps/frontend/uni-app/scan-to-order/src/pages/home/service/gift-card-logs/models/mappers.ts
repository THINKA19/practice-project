/**
 * ============================================================================
 * 【文件概述】流水响应校验与空结果归一化，阻止畸形数据进入分页状态。
 * 【方法与导出清单】parseCardLogsPage(value)。
 * 【综合使用示例】
 * import { parseCardLogsPage } from './mappers'
 * parseCardLogsPage(null) // => { result: [] }
 * ============================================================================
 */
import type { CardLog, CardLogsPage } from './types'

/**
 * 校验流水分页结果；可选事件扩展仍允许后端缺省。
 * @param value unknown；已由公共 HTTP 解包的数据。
 * @returns CardLogsPage；null 为空列表，畸形字段抛出 Error。
 * @example parseCardLogsPage({ result: [], totalPage: 0 }) // => 空分页
 */
export function parseCardLogsPage(value: unknown): CardLogsPage {
  if (value == null)
    return { result: [] }
  if (typeof value !== 'object' || !('result' in value) || !Array.isArray(value.result))
    throw new Error('流水响应格式无效')
  const result = value.result.map((row: unknown): CardLog => {
    if (!row || typeof row !== 'object' || !('id' in row) || !Number.isSafeInteger(row.id) || Number(row.id) <= 0 || !('amount' in row) || typeof row.amount !== 'number' || !Number.isFinite(row.amount) || !('dateAdd' in row) || typeof row.dateAdd !== 'string')
      throw new Error('流水记录格式无效')
    const log = row as CardLog
    if ((log.balance !== undefined && (typeof log.balance !== 'number' || !Number.isFinite(log.balance))) || (log.remark !== undefined && typeof log.remark !== 'string') || (log.typeStr !== undefined && typeof log.typeStr !== 'string') || (log.direction !== undefined && !['credit', 'debit', 'none'].includes(log.direction)) || (log.eventType !== undefined && typeof log.eventType !== 'string') || (log.relatedLogId !== undefined && (!Number.isSafeInteger(log.relatedLogId) || log.relatedLogId <= 0)))
      throw new Error('流水扩展字段无效')
    return { ...log }
  })
  const totalPage = 'totalPage' in value ? value.totalPage : undefined
  if (totalPage !== undefined && (typeof totalPage !== 'number' || !Number.isSafeInteger(totalPage) || totalPage < 0))
    throw new Error('流水分页信息无效')
  return { result, totalPage }
}
