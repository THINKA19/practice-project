/**
 * ============================================================================
 * 【文件概述】结算与支付 / api/payment.dto.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - WxPayDataDto：数据类型契约。
 * - PayBillDiscountDto：数据类型契约。
 * - PeisongFeeDto：数据类型契约。
 * 【综合使用示例】
 * import type { WxPayDataDto } from '@/pages/ordering/menu-pay/api/payment.dto'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * 原始接口契约；字段按现有页面需求整理，待真实后端联调确认。
 * 结构字段：timeStamp、nonceStr、package、signType、paySign；必填与可选字段见声明。
 * @example
 * import type { WxPayDataDto } from '@/pages/ordering/menu-pay/api/payment.dto'
 * declare const response: WxPayDataDto
 * const value: WxPayDataDto = response // => 保留 WxPayDataDto 的字段与取值约束
 */

export interface WxPayDataDto {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
  [k: string]: unknown
}

/**
 * PayBillDiscountDto 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：id、consume、discounts；必填与可选字段见声明。
 * @example
 * import type { PayBillDiscountDto } from '@/pages/ordering/menu-pay/api/payment.dto'
 * declare const response: PayBillDiscountDto
 * const value: PayBillDiscountDto = response // => 保留 PayBillDiscountDto 的字段与取值约束
 */
export interface PayBillDiscountDto {
  id: number
  consume: number
  discounts: number
  [k: string]: unknown
}

/**
 * 配送费阶梯（apifm /fee/peisong/list）
 * distance 为该档位覆盖的最大距离（km）
 * 结构字段：id、distance；必填与可选字段见声明。
 * @example
 * import type { PeisongFeeDto } from '@/pages/ordering/menu-pay/api/payment.dto'
 * declare const response: PeisongFeeDto
 * const value: PeisongFeeDto = response // => 保留 PeisongFeeDto 的字段与取值约束
 */
export interface PeisongFeeDto {
  id: number
  distance: number
  [k: string]: unknown
}
