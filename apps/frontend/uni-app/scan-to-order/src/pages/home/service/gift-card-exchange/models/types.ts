/**
 * ============================================================================
 * 【文件概述】兑换领域请求契约，不持有卡包副本。
 * 【方法与导出清单】CardExchangeInput：兑换码请求。
 * 【综合使用示例】
 * import type { CardExchangeInput } from './types'
 * const input: CardExchangeInput = { number: 'GIFT-DEMO' }
 * ============================================================================
 */
/**
 * 兑换码输入；提交前去除首尾空白，协议确认仅属于页面状态。
 * @example const input: CardExchangeInput = { number: 'GIFT-DEMO' }
 */
export interface CardExchangeInput {
  number: string
}
