/**
 * ============================================================================
 * 【文件概述】所属业务的内存模拟状态，实例只在开发会话中存在。
 * 【方法与导出清单】createPickupState、pickupState。
 * 【综合使用示例】
 * import { createPickupState } from '@/pages/pickup/shared/mock/state'
 * ============================================================================
 */
import { createPickupOrders } from './data'
/**
 * 创建按顾客隔离的取餐模拟状态。
 * 无参数。
 * @returns 包含查询、操作和 reset 的独立内存状态。
 * @example createPickupState() // 返回独立状态实例，含 reset()
 */
export function createPickupState() {
  const verified = new Map<string, Set<string>>()
  function status(owner: string, code: string) {
    return verified.get(owner)?.has(code) ? 3 : 1
  }
  function verify(owner: string, code: string) {
    if (!createPickupOrders().orderList.some(order => order.hxNumber === code))
      return false
    const codes = verified.get(owner) ?? new Set<string>()
    if (codes.has(code))
      return false
    codes.add(code)
    verified.set(owner, codes)
    return true
  }
  function list(owner: string) {
    const data = createPickupOrders()
    data.orderList = data.orderList.filter(order => status(owner, order.hxNumber) !== 3)
    return data
  }
  return { status, verify, list, reset: () => verified.clear() }
}
export const pickupState = createPickupState()
