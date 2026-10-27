/**
 * 营销上下文 - 领域模型（优惠券、礼品卡、拼团、砍价）
 */

/* ---------------- 优惠券 ---------------- */
export interface CouponTemplate {
  id: number
  name: string
  /** 面额（满减金额 / 折扣） */
  moneyMin: number
  moneyMax: number
  /** 满多少可用 */
  moneyHreshold: number
  /** 0 满减 1 折扣 */
  type?: number
  numberLeft?: number
  numberPersonMax?: number
  dateEndType?: number
  dateEnd?: string
  dateEndDays?: number
  needScore?: number
  needAmount?: number
  pwd?: boolean
  /** 当前顾客已领取；缺省时由本次领取成功状态补充。 */
  claimed?: boolean
  /** 0 满减（元） 1 折扣 */
  moneyType?: number
  /** 适用范围（券详情返回）：type 0 分类 1 商品 */
  couponRefs?: CouponRef[]
  [k: string]: unknown
}

export interface CouponRef {
  type: number
  refId: number | string
  [k: string]: unknown
}

export interface MyCoupon {
  id: number
  pid: number
  name: string
  money: number
  moneyHreshold: number
  dateStart?: string
  dateEnd?: string
  status: number
  statusStr?: string
  type?: number
  /** 0 满减（元） 1 折扣 */
  moneyType?: number
  [k: string]: unknown
}

export interface CouponStatistics {
  canUse: number
  used?: number
  invalid?: number
  [k: string]: unknown
}

/** 优惠券“去使用”的目标（原 touse）：无限制回点餐页，限分类跳分类列表，限商品跳商品详情 */
export type CouponUseTarget
  = | { kind: 'menu' }
    | { kind: 'category', categoryId: number | string }
    | { kind: 'goods', goodsId: number | string }
    | { kind: 'none' }
