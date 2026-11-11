/**
 * ============================================================================
 * 【文件概述】兑换专属开发样本，每次返回独立兑换规则。
 * 【方法与导出清单】createExchangeFixture。
 * 【综合使用示例】
 * import { createExchangeFixture } from './data'
 * createExchangeFixture().number // => 'GIFT-DEMO'
 * ============================================================================
 */
/**
 * 创建演示兑换规则，不包含持卡资产副本。
 * 无参数。
 * @returns 兑换码和目标模板编号；每个账户可使用一次。
 * @example createExchangeFixture() // => { number: 'GIFT-DEMO', templateId: 1 }
 */
export function createExchangeFixture() {
  return { number: 'GIFT-DEMO', templateId: 1 }
}
