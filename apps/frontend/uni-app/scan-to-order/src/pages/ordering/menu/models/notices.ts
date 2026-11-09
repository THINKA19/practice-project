/**
 * ============================================================================
 * 【文件概述】菜单选品 / models/notices.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - normalizeNotices：本文件对外声明。
 * 【综合使用示例】
 * import { normalizeNotices } from '@/pages/ordering/menu/models/notices'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { OrderingNotice } from './types'

/**
 * 兼容既有单条公告响应与公告列表，拒绝缺少消息正文的异常数据。
 * @param value {unknown} 待转换或判断的数据。
 * @returns OrderingNotice[]。
 * @example
 * import { normalizeNotices } from '@/pages/ordering/menu/models/notices'
 * declare const value: Parameters<typeof normalizeNotices>[0]
 * normalizeNotices(value) // => OrderingNotice[]
 */
export function normalizeNotices(value: unknown): OrderingNotice[] {
  if (value == null)
    return []
  const rows: unknown[] = Array.isArray(value) ? value : [value]
  return rows.map((row) => {
    if (!row || typeof row !== 'object')
      throw new Error('公告数据格式不正确')
    const item = row as Record<string, unknown>
    if (!Number.isInteger(item.id) || Number(item.id) <= 0 || typeof item.title !== 'string' || !item.title.trim() || typeof item.content !== 'string')
      throw new Error('公告数据格式不正确')
    return { id: Number(item.id), title: item.title, content: item.content, publishedAt: typeof item.publishedAt === 'string' ? item.publishedAt : undefined }
  })
}
