/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

export interface CardLogDto {
  id: number
  amount: number
  remark?: string
  dateAdd: string
  typeStr?: string
  balance?: number
  [k: string]: unknown
}

/** 领取礼品卡预览（cardShareFetch calculate=true） */
export interface CardShareFetchResultDto {
  user?: CardUserBriefDto
  cardUser?: MyCardDto
  cardInfo?: CardTemplateDto
  [k: string]: unknown
}

/* ---------------- 礼品卡 ---------------- */
export interface CardTemplateDto {
  id: number
  name: string
  pic?: string
  amount: number
  price?: number
  /** 赠送留言（领取页展示） */
  shareContent?: string
  [k: string]: unknown
}

export interface MyCardDto {
  id: number
  cardId: number
  cardInfo?: CardTemplateDto
  amount: number
  status: number
  dateEnd?: string
  shareId?: number
  /** 0 次卡（杯） 1 储值卡（元） */
  type?: number
  isActive?: boolean
  /** 来自他人赠送 */
  fromUid?: number
  fromUser?: CardUserBriefDto
  /** 赠送中的分享 token */
  shareToken?: string
  [k: string]: unknown
}

/** 赠送人/来源用户 */
export interface CardUserBriefDto {
  avatarUrl?: string
  nick?: string
  [k: string]: unknown
}
