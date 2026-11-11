/**
 * ============================================================================
 * 【文件概述】兑换模拟状态，只拥有各账户已使用的兑换码。
 * 【方法与导出清单】createExchangeState、exchangeState、reset。
 * 【综合使用示例】
 * import { createExchangeState } from './state'
 * const state = createExchangeState()
 * state.has('customer', 'GIFT-DEMO') // => false
 * ============================================================================
 */
/**
 * 创建独立兑换记录实例。
 * 无参数。
 * @returns has、mark、reset 操作；不持有其他模块数据。
 * @example createExchangeState().has('customer', 'code') // => false
 */
export function createExchangeState() {
  const used = new Map<string, Set<string>>()
  return {
    /**
     * 检查本账户是否已使用兑换码。
     * @param account string；演示客户账户。
     * @param number string；兑换码。
     * @returns boolean；未使用返回 false。
     * @example state.has('customer', 'GIFT-DEMO') // => 初始 false
     */
    has(account: string, number: string) {
      return used.get(account)?.has(number) ?? false
    },
    /**
     * 在发卡成功后标记已兑换。
     * @param account string；演示客户账户。
     * @param number string；兑换码。
     * @returns {void} 仅修改本账户兑换记录。
     * @example state.mark('customer', 'GIFT-DEMO') // => 后续 has 为 true
     */
    mark(account: string, number: string) {
      const codes = used.get(account) ?? new Set<string>()
      codes.add(number)
      used.set(account, codes)
    },
    /**
     * 清空兑换记录。
     * 无参数。
     * @returns {void} 保留实例身份。
     * @example state.reset() // => 所有兑换码恢复未使用
     */
    reset() { used.clear() },
  }
}
/** 当前运行环境唯一兑换实例。 */
export const exchangeState = createExchangeState()
/**
 * 公共加载器调用的兑换重置。
 * 无参数。
 * @returns {void} 不重置资产或流水。
 * @example reset() // => 清空兑换记录
 */
export function reset() {
  exchangeState.reset()
}
