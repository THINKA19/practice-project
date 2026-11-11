/**
 * ============================================================================
 * 【文件概述】卡包模型层，只拥有模板、持卡和来源摘要。
 * 【方法与导出清单】CardTemplate、MyCard、CardUserBrief、MyCardState。
 * 【综合使用示例】
 * import type { MyCard } from '@/pages/home/service/gift-card'
 * const card: MyCard = { id: 7, cardId: 1, amount: 100, status: 0 }
 * ============================================================================
 */
/**
 * 卡模板：amount 为权益数量，price 为购买价格；真实单位以服务端为准。
 * @example const card: CardTemplate = { id: 1, name: '礼品卡', amount: 100 }
 */
export interface CardTemplate {
  id: number
  name: string
  pic?: string
  amount: number
  price?: number
  /** 赠送留言（领取页展示） */
  shareContent?: string
  [k: string]: unknown
}

/**
 * 持卡来源用户摘要，不包含身份凭证。
 * @example const user: CardUserBrief = { nick: '好友' }
 */
export interface CardUserBrief {
  avatarUrl?: string
  nick?: string
  [k: string]: unknown
}

/**
 * 用户持卡事实；id 是持卡编号，cardId 是模板编号，type=0 次数、1 金额。
 * @example const card: MyCard = { id: 7, cardId: 1, amount: 100, status: 0 }
 */
export interface MyCard {
  id: number
  cardId: number
  cardInfo?: CardTemplate
  amount: number
  status: number
  dateEnd?: string
  shareId?: number
  /** 0 次卡（杯） 1 储值卡（元） */
  type?: number
  isActive?: boolean
  /** 来自他人赠送 */
  fromUid?: number
  fromUser?: CardUserBrief
  /** 赠送中的分享 token */
  shareToken?: string
  [k: string]: unknown
}

/**
 * 前端持卡展示状态，不替代服务端授权。
 * @example const state: MyCardState = 'canShare'
 */
export type MyCardState = 'canShare' | 'sharing' | 'active' | 'expired' | 'empty'
