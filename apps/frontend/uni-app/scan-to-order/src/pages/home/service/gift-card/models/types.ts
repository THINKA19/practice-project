/* ---------------- 礼品卡 ---------------- */
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

/** 赠送人/来源用户 */
export interface CardUserBrief {
  avatarUrl?: string
  nick?: string
  [k: string]: unknown
}

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

export interface CardLog {
  id: number
  amount: number
  remark?: string
  dateAdd: string
  typeStr?: string
  balance?: number
  [k: string]: unknown
}

/** 我的礼品卡展示状态（原 card/index.wxml 的分支） */
export type MyCardState = 'canShare' | 'sharing' | 'active'

/** 领取礼品卡预览（cardShareFetch calculate=true） */
export interface CardShareFetchResult {
  user?: CardUserBrief
  cardUser?: MyCard
  cardInfo?: CardTemplate
  [k: string]: unknown
}
