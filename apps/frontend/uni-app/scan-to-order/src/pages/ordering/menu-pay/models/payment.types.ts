/**
 * ============================================================================
 * 【文件概述】结算与支付 / models/payment.types.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - PayChannel：数据类型契约。
 * - NextAction：数据类型契约。
 * - PayIntent：数据类型契约。
 * - WxPayData：数据类型契约。
 * - PayBillDiscount：数据类型契约。
 * - PayPlan：数据类型契约。
 * - YouhuiPayPlan：数据类型契约。
 * - PeisongFee：数据类型契约。
 * 【综合使用示例】
 * import type { PayChannel } from '@/pages/ordering/menu-pay/models/payment.types'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * PayChannel 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：'wx' | 'alipay'。
 * @example
 * import type { PayChannel } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: PayChannel
 * const value: PayChannel = response // => 保留 PayChannel 的字段与取值约束
 */
export type PayChannel = 'wx' | 'alipay'

/**
 * 支付成功后的后续动作（apifm nextAction）
 * type 0 支付订单；4 优惠买单
 * 值约束：| { type: 0, id: number | string } | { type: 4, uid: number | string, money: number } | { type: number, [k: string]: unknown }。
 * @example
 * import type { NextAction } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: NextAction
 * const value: NextAction = response // => 保留 NextAction 的字段与取值约束
 */
export type NextAction
  = | { type: 0, id: number | string }
    | { type: 4, uid: number | string, money: number }
    | { type: number, [k: string]: unknown }

/**
 * PayIntent 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：money、remark、nextAction、extData；必填与可选字段见声明。
 * @example
 * import type { PayIntent } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: PayIntent
 * const value: PayIntent = response // => 保留 PayIntent 的字段与取值约束
 */
export interface PayIntent {
  money: number
  remark: string
  nextAction?: NextAction
  /** 额外透传字段 */
  extData?: Record<string, string | number>
}

/**
 * WxPayData 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：timeStamp、nonceStr、package、signType、paySign；必填与可选字段见声明。
 * @example
 * import type { WxPayData } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: WxPayData
 * const value: WxPayData = response // => 保留 WxPayData 的字段与取值约束
 */
export interface WxPayData {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
  [k: string]: unknown
}

/**
 * PayBillDiscount 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、consume、discounts；必填与可选字段见声明。
 * @example
 * import type { PayBillDiscount } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: PayBillDiscount
 * const value: PayBillDiscount = response // => 保留 PayBillDiscount 的字段与取值约束
 */
export interface PayBillDiscount {
  id: number
  consume: number
  discounts: number
  [k: string]: unknown
}

/**
 * 待支付订单的支付计划（原 all-orders toPayTap 中的计算）
 * - 积分不足：不可支付
 * - remain<=0：余额足够，直接余额支付
 * 结构字段：ok、reason、orderMoney、balance、remain、needScore；必填与可选字段见声明。
 * @example
 * import type { PayPlan } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: PayPlan
 * const value: PayPlan = response // => 保留 PayPlan 的字段与取值约束
 */
export interface PayPlan {
  ok: boolean
  reason?: 'scoreNotEnough'
  orderMoney: number
  balance: number
  /** 仍需在线支付的金额 */
  remain: number
  needScore: number
}

/**
 * YouhuiPayPlan 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：rule、needPayAmount、wxpayAmount；必填与可选字段见声明。
 * @example
 * import type { YouhuiPayPlan } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: YouhuiPayPlan
 * const value: YouhuiPayPlan = response // => 保留 YouhuiPayPlan 的字段与取值约束
 */
export interface YouhuiPayPlan {
  /** 命中的满减规则 */
  rule?: PayBillDiscount
  /** 优惠后应付 */
  needPayAmount: number
  /** 扣除余额后仍需在线支付（<=0 表示余额足够） */
  wxpayAmount: number
}

/**
 * 配送费阶梯（apifm /fee/peisong/list）
 * distance 为该档位覆盖的最大距离（km）
 * 结构字段：id、distance；必填与可选字段见声明。
 * @example
 * import type { PeisongFee } from '@/pages/ordering/menu-pay/models/payment.types'
 * declare const response: PeisongFee
 * const value: PeisongFee = response // => 保留 PeisongFee 的字段与取值约束
 */
export interface PeisongFee {
  id: number
  distance: number
  [k: string]: unknown
}
