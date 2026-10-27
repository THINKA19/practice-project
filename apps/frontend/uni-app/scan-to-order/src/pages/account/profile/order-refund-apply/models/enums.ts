/**
 * 售后（退款/退货/换货）申请规则。从订单领域迁入（2026-10-18）：只被售后申请使用。
 * 订单商品、售后单等数据结构仍由订单领域拥有（@/pages/account/profile/order）。
 */

/** 售后申请：当前商品正在售后中（接口返回码） */
export const REFUND_APPLYING_CODE = 20000

/** 售后类型：0 仅退款 1 退货退款 2 换货 */
export const RefundType = {
  REFUND: '0',
  RETURN_REFUND: '1',
  EXCHANGE: '2',
} as const
