/**
 * 订单领域公共入口，仅导出外部使用的能力。
 * 分组：接口 / 规则 / 类型。售后申请规则由 order-refund-apply/domain/refund-apply.rules.ts 维护。
 * 会话使用 pages/auth/session，页面交互归实际调用方。
 */

// 接口
export { orderApi, uploadOrderFile } from './composables/use-requests'

// 规则
export { attachRefundGoods, canApplyRefund, canCallShop, canCancel, canConfirmReceive, canDeleteInList, canEvaluate, canPay, fullAddress, logisticsOf, orderIdFromPayNextAction, orderListStatusKey } from './domain/order.rules'

// 类型
export type { Order, OrderDetail, OrderGoods, OrderGoodsCoupon, OrderLogistics, RefundableGoods, RefundApplyRecord, ReputationItem, ReputationLevel } from './models/types'
