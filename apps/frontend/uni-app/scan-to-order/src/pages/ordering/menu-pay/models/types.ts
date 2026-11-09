/**
 * ============================================================================
 * 【文件概述】结算与支付 / models/types.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - PayShop：数据类型契约。
 * - OrderPayload：数据类型契约。
 * - PayPageQuery：数据类型契约。
 * - CheckoutPageModel：数据类型契约。
 * 【综合使用示例】
 * import type { PayShop } from '@/pages/ordering/menu-pay/models/types'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * 结算页内部共享类型（仅本页 composable 之间使用）
 */
import type { Shop } from '@/pages/ordering/index'

/**
 * 结算页用到的门店扩展字段（apifm 门店详情，shop 上下文模型未声明）
 * 结构字段：openWaimai、openZiqu、serviceDistance、serviceAmountMin、number、expressType；必填与可选字段见声明。
 * @example
 * import type { PayShop } from '@/pages/ordering/menu-pay/models/types'
 * declare const response: PayShop
 * const value: PayShop = response // => 保留 PayShop 的字段与取值约束
 */
export interface PayShop extends Shop {
  openWaimai?: boolean
  openZiqu?: boolean
  /** 配送范围（km） */
  serviceDistance?: number | string
  /** 起送金额 */
  serviceAmountMin?: number
  /** 达达门店编号 */
  number?: string
  expressType?: string
}

/**
 * 下单参数（/order/create）
 * 值约束：Record<string, string | number | boolean | undefined>。
 * @example
 * import type { OrderPayload } from '@/pages/ordering/menu-pay/models/types'
 * declare const response: OrderPayload
 * const value: OrderPayload = response // => 保留 OrderPayload 的字段与取值约束
 */
export type OrderPayload = Record<string, string | number | boolean | undefined>

/**
 * PayPageQuery 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：orderType、pingtuanOpenId、kjId；必填与可选字段见声明。
 * @example
 * import type { PayPageQuery } from '@/pages/ordering/menu-pay/models/types'
 * declare const response: PayPageQuery
 * const value: PayPageQuery = response // => 保留 PayPageQuery 的字段与取值约束
 */
export interface PayPageQuery {
  /** buyNow：立即购买（拼团），商品取自 storage.pingtuanGoodsList */
  orderType?: string
  pingtuanOpenId?: string
  kjId?: string
}

/**
 * 结算编排；依赖 cart、shop、payment 及账户订单领域。
 * 结构字段：shopId、deliveryType、remark、submitting；必填与可选字段见声明。
 * @example
 * import type { CheckoutPageModel } from '@/pages/ordering/menu-pay/models/types'
 * declare const response: CheckoutPageModel
 * const value: CheckoutPageModel = response // => 保留 CheckoutPageModel 的字段与取值约束
 */
export interface CheckoutPageModel { shopId: number | null, deliveryType: 'zq' | 'kd', remark: string, submitting: boolean }
