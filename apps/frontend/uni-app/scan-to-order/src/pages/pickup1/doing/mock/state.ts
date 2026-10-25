/**
 * ============================================================================
 * 【文件概述】所属业务的内存模拟状态，实例只在开发会话中存在。
 * 【方法与导出清单】createDemoOrders、createDemoPickupState、demoPickupState。
 * 【综合使用示例】
 * import { createDemoOrders } from '@/pages/pickup1/doing/mock/state'
 * ============================================================================
 */
import { createPickupOrders } from '@/pages/pickup/index/mock'

/**
 * 创建独立演示订单，保留准备中与配送场景。
 * 无参数。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createDemoOrders().orderList.length // 3
 */
export function createDemoOrders() {
  const data = createPickupOrders()
  data.orderList = data.orderList.map(order => ({ ...order, fulfillment: order.isNeedLogistics ? 'delivering' : 'ready' }))
  data.orderList.push({ id: '103', hxNumber: 'MOCK-PICKUP-103', qudanhao: 'A09', isNeedLogistics: false, amountReal: 18, dateAdd: '2026-10-24 11:45:00', fulfillment: 'preparing' })
  data.goodsMap['103'] = [{ id: 'g5', goodsName: '美式咖啡', property: '大杯 / 热', number: 1, amount: 18 }]
  return data
}

/**
 * 创建独立的演示取餐与核销状态。
 * 无参数。
 * @returns 包含查询、操作和 reset 的独立内存状态。
 * @example createDemoPickupState() // 返回独立状态实例，含 reset()
 */
export function createDemoPickupState() {
  const completed = new Map<string, Set<string>>()
  function status(owner: string, code: string) {
    return completed.get(owner)?.has(code) ? 3 : 1
  }
  function verify(owner: string, code: string) {
    const order = createDemoOrders().orderList.find(item => item.hxNumber === code)
    if (!order || order.fulfillment === 'preparing' || status(owner, code) === 3)
      return false
    const codes = completed.get(owner) ?? new Set<string>()
    codes.add(code)
    completed.set(owner, codes)
    return true
  }
  function list(owner: string) {
    const data = createDemoOrders()
    data.orderList = data.orderList.filter(order => status(owner, order.hxNumber) !== 3)
    return data
  }
  return { status, verify, list, reset: () => completed.clear() }
}

export const demoPickupState = createDemoPickupState()
