/**
 * ============================================================================
 * 【文件概述】领取预览边界校验，缺少持卡事实时不允许提交领取。
 * 【方法与导出清单】parseSharePreview(value)。
 * 【综合使用示例】
 * import { parseSharePreview } from './mappers'
 * const preview = parseSharePreview({ cardUser: { id: 7, cardId: 1, amount: 100, status: 0 }, cardInfo: { id: 1, name: '礼品卡', amount: 100 } }) // => 可展示预览
 * ============================================================================
 */
import type { CardShareFetchResult } from './types'

/**
 * 校验领取预览必需字段并复制嵌套数据。
 * @param value unknown；calculate=true 的原始响应。
 * @returns CardShareFetchResult；无效时抛出 Error。
 * @example parseSharePreview({ cardUser: { id: 7, cardId: 1, amount: 100, status: 0 }, cardInfo: { id: 1, name: '礼品卡', amount: 100 } }) // => 可展示预览
 */
export function parseSharePreview(value: unknown): CardShareFetchResult {
  if (!value || typeof value !== 'object')
    throw new Error('领取预览格式无效')
  const preview = value as Partial<CardShareFetchResult>
  const card = preview.cardUser
  const info = preview.cardInfo
  if (!card || !info || !Number.isSafeInteger(card.id) || card.id <= 0 || !Number.isSafeInteger(card.cardId) || card.cardId <= 0 || typeof card.amount !== 'number' || !Number.isFinite(card.amount) || typeof card.status !== 'number' || !Number.isFinite(card.status) || info.id !== card.cardId || typeof info.name !== 'string' || typeof info.amount !== 'number' || !Number.isFinite(info.amount))
    throw new Error('领取卡片信息无效')
  if ((info.pic !== undefined && typeof info.pic !== 'string') || (info.shareContent !== undefined && typeof info.shareContent !== 'string') || (preview.user !== undefined && (!preview.user || typeof preview.user !== 'object' || (preview.user.nick !== undefined && typeof preview.user.nick !== 'string') || (preview.user.avatarUrl !== undefined && typeof preview.user.avatarUrl !== 'string'))))
    throw new Error('领取展示信息无效')
  return { cardUser: { ...card }, cardInfo: { ...info }, user: preview.user ? { ...preview.user } : undefined }
}
