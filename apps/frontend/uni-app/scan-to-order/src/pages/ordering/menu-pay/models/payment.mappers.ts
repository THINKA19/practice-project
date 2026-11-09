/**
 * ============================================================================
 * 【文件概述】结算与支付 / models/payment.mappers.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - toDiscounts：把买单优惠 DTO 转换为计费规则列表。
 * - toDeliveryFees：把配送费 DTO 转换为距离档位与费用列表。
 * 【综合使用示例】
 * import { toDiscounts } from '@/pages/ordering/menu-pay/models/payment.mappers'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { PayBillDiscountDto, PeisongFeeDto } from '../api/payment.dto'
import type { PayBillDiscount, PeisongFee } from './payment.types'

/**
 * 把买单优惠 DTO 转换为计费规则列表。
 * @param dto {PayBillDiscountDto[]} 服务端原始响应。
 * @returns PayBillDiscount[]。
 * @example
 * import { toDiscounts } from '@/pages/ordering/menu-pay/models/payment.mappers'
 * declare const dto: Parameters<typeof toDiscounts>[0]
 * toDiscounts(dto) // => PayBillDiscount[]
 */
export function toDiscounts(dto: PayBillDiscountDto[]): PayBillDiscount[] {
  return dto.map(rule => ({ ...rule }))
}
/**
 * 把配送费 DTO 转换为距离档位与费用列表。
 * @param dto {PeisongFeeDto[]} 服务端原始响应。
 * @returns PeisongFee[]。
 * @example
 * import { toDeliveryFees } from '@/pages/ordering/menu-pay/models/payment.mappers'
 * declare const dto: Parameters<typeof toDeliveryFees>[0]
 * toDeliveryFees(dto) // => PeisongFee[]
 */
export function toDeliveryFees(dto: PeisongFeeDto[]): PeisongFee[] {
  return dto.map(fee => ({ ...fee }))
}
