/**
 * ============================================================================
 * 【文件概述】结算与支付 / index.ts
 * 公开边界：显式导出实际消费者使用的能力。
 * 【方法与导出清单】
 * - paymentApi：本文件对外声明。
 * - PaymentPanel：本文件对外声明。
 * - usePayOrder：本文件对外声明。
 * - planOrderPayment：结合余额与积分生成订单支付计划。
 * - ORDER_NEXT_ACTION_TYPE：本文件对外声明。
 * - orderPayNextAction：生成指定订单支付后的业务动作。
 * - matchPeisongFee：按配送距离匹配服务端提供的配送费档位。
 * - applyPayBillDiscount：按命中的买单规则计算优惠后的金额。
 * - parseAlipayQrcode：解析支付宝二维码返回值，拒绝无效内容。
 * - planYouhuiPay：根据消费金额、优惠规则和余额生成买单计划。
 * - toDeliveryFees：把配送费 DTO 转换为距离档位与费用列表。
 * - toDiscounts：把买单优惠 DTO 转换为计费规则列表。
 * - PayPlan：数据类型契约。
 * - NextAction：数据类型契约。
 * - PeisongFee：数据类型契约。
 * - PayBillDiscount：数据类型契约。
 * - useGoodsDraftStore：本文件对外声明。
 * 【综合使用示例】
 * import { paymentApi } from '@/pages/ordering/menu-pay/index'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
export { paymentApi } from './api/payment.api'
export { default as PaymentPanel } from './components/PaymentPanel/index.vue'
export { usePayOrder } from './composables/use-order'
export { planOrderPayment } from './domain/payment.rules'
export { ORDER_NEXT_ACTION_TYPE, orderPayNextAction } from './domain/payment.rules'
export { matchPeisongFee } from './domain/payment.rules'
export { applyPayBillDiscount } from './domain/payment.rules'
export { parseAlipayQrcode } from './domain/payment.rules'
export { planYouhuiPay } from './domain/payment.rules'
export { toDeliveryFees, toDiscounts } from './models/payment.mappers'
/** 本模块公共入口，仅导出外部使用的能力。 */
export type { PayPlan } from './models/payment.types'
export type { NextAction } from './models/payment.types'
export type { PeisongFee } from './models/payment.types'
export type { PayBillDiscount } from './models/payment.types'

export { useGoodsDraftStore } from './store'
