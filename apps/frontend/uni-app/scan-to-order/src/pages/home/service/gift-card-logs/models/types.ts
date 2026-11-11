/**
 * ============================================================================
 * 【文件概述】流水领域模型，拥有事件字段、查询条件和分页结果。
 * 【方法与导出清单】CardLog、CardLogsInput、CardLogsPage。
 * 【综合使用示例】
 * import type { CardLogsInput } from './types'
 * const input: CardLogsInput = { cardId: 7, page: 1, pageSize: 20 }
 * ============================================================================
 */
/**
 * 礼品卡事件；amount 为绝对数量，单位取持卡 type，时间格式待后端核实。
 * @example const log: CardLog = { id: 1, amount: 10, dateAdd: '2026-11-10', direction: 'debit' }
 */
export interface CardLog {
  id: number
  amount: number
  /** 可选事件扩展；旧接口缺省时按消费记录兼容。 */
  eventType?: 'purchase' | 'consume' | 'refund' | 'exchange' | 'share' | 'cancel' | 'receive' | 'shareExpired'
  direction?: 'debit' | 'credit' | 'none'
  relatedLogId?: number
  remark?: string
  dateAdd: string
  typeStr?: string
  balance?: number
  [k: string]: unknown
}

/**
 * 持卡流水查询；page 从 1 开始，pageSize 为正整数。
 * @example const input: CardLogsInput = { cardId: 7, page: 1, pageSize: 20 }
 */
export interface CardLogsInput {
  cardId: number | string
  page?: number
  pageSize?: number
}

/**
 * 分页结果；totalPage 缺省时按返回条数判断末页。
 * @example const page: CardLogsPage = { result: [], totalPage: 0 }
 */
export interface CardLogsPage {
  result: CardLog[]
  totalPage?: number
}
