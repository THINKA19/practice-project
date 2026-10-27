/** 我的优惠券状态：0 可用 1 已使用/失效 ... 与 apifm 保持一致 */
export const MyCouponStatus = {
  USABLE: 0,
  USED_OR_INVALID: '1,2,3',
} as const

/** 领券失败业务码（原 coupons/index.js getCounpon） */
export const CouponFetchCode = {
  /** 来晚了（已领完） */
  SOLD_OUT: 20001,
  /** 来晚了（未开始/已结束） */
  NOT_AVAILABLE: 20002,
  /** 已领过 */
  RECEIVED: 20003,
  /** 已过期 */
  EXPIRED: 20004,
  /** 积分不足 */
  SCORE_NOT_ENOUGH: 30001,
} as const
