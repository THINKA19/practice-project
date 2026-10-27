/**
 * 会员资产上下文 - 领域模型（余额、积分、成长值、签到、等级、充值）
 */

export interface UserAmount {
  balance: number
  freeze: number
  score: number
  growth?: number
  totalPayAmount?: number
  totalPayNumber?: number
  totalConsumed?: number
  /** 累计消费（apifm 实际返回字段名，原 member-center 使用） */
  totleConsumed?: number
  [k: string]: unknown
}

export interface RechargeRule {
  id: number
  confine: number
  send: number
  loop?: boolean
  [k: string]: unknown
}

export interface AssetPage<T> {
  list: T[]
  totalPage?: number
  totalRow?: number
}
