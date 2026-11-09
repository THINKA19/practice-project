/**
 * ============================================================================
 * 【文件概述】结算与支付 / mock/fixtures/payment.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - discounts：本文件对外声明。
 * - deliveryFees：本文件对外声明。
 * - paymentUnavailable：本文件对外声明。
 * 【综合使用示例】
 * import { discounts } from '@/pages/ordering/menu-pay/mock/fixtures/payment'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { PayBillDiscountDto, PeisongFeeDto } from '../../api/payment.dto'

/**
 * discounts：供本领域调用的数据声明。
 * @returns PayBillDiscountDto[]；不是独立请求的执行结果。
 * @example
 * import { discounts } from '@/pages/ordering/menu-pay/mock/fixtures/payment'
 * discounts // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const discounts: PayBillDiscountDto[] = [{ id: 1, consume: 50, discounts: 5 }, { id: 2, consume: 100, discounts: 12 }]
/**
 * deliveryFees：供本领域调用的数据声明。
 * @returns PeisongFeeDto[]；不是独立请求的执行结果。
 * @example
 * import { deliveryFees } from '@/pages/ordering/menu-pay/mock/fixtures/payment'
 * deliveryFees // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const deliveryFees: PeisongFeeDto[] = [{ id: 1, distance: 3, fee: 3 }, { id: 2, distance: 5, fee: 5 }]
/**
 * paymentUnavailable：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { paymentUnavailable } from '@/pages/ordering/menu-pay/mock/fixtures/payment'
 * paymentUnavailable.code // => 读取对应命名能力或配置
 */
export const paymentUnavailable = { code: 503, message: '演示环境不创建真实支付单', data: null }
