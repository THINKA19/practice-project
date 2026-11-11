/**
 * ============================================================================
 * 【文件概述】领取领域契约，区分预览请求与领取动作。
 * 【方法与导出清单】CardReceiveInput、CardShareFetchResult。
 * 【综合使用示例】
 * import type { CardReceiveInput } from './types'
 * const input: CardReceiveInput = { id: 7, shareToken: 'example', calculate: true }
 * ============================================================================
 */
import type { CardTemplate, CardUserBrief, MyCard } from '../../gift-card'

/**
 * 领取请求；calculate=true 仅预览，false 才转移持卡权；凭证不持久化。
 * @example const input: CardReceiveInput = { id: 7, shareToken: 'example', calculate: true }
 */
export interface CardReceiveInput {
  id: number | string
  shareToken: string
  calculate: boolean
}

/**
 * 领取预览：卡片与模板必需，赠送人摘要可选；写操作返回不作为预览使用。
 * @example const preview: CardShareFetchResult = { cardUser: { id: 7, cardId: 1, amount: 100, status: 0 }, cardInfo: { id: 1, name: '礼品卡', amount: 100 } }
 */
export interface CardShareFetchResult {
  user?: CardUserBrief
  cardUser: MyCard
  cardInfo: CardTemplate
}
