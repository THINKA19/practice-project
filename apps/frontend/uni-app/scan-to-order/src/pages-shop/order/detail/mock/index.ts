/**
 * ============================================================================
 * 门店订单详情模拟服务
 * ============================================================================
 *
 * 【文件概述】
 * 详情处理器通过列表 Mock 入口访问同一份门店订单。
 *
 * 【方法与导出清单】
 * - handle：查询详情、提交履约动作或模拟打印。
 *
 * 【综合使用示例】
 * ```typescript
 * import { handle } from '@/pages-shop/order/detail/mock'
 * // 模拟适配器调用 handle(endpoint, data, token)
 * ```
 * ============================================================================
 */
import { authorize } from '@/pages-shop/auth/permissions/mock'
import { hasShopPermission } from '@/pages-shop/auth/permissions/models/policy'
import { SHOP_ORDER_STATUS, withoutOrderAmounts } from '../../list'
import type { ShopOrder } from '../../list'
import { getOrderRecord } from '../../list/mock'
import { endpoints } from '../api/endpoints'

/**
 * 模拟详情查询、打印及版本受控的订单动作。
 * @param endpoint 详情模块端点。
 * @param data 门店 ID、订单编号及动作需要的版本。
 * @param token 模拟商家会话凭证。
 * @returns 已授权的订单副本或打印任务结果。
 * @example handle(endpoints.detail, { shopId: 'A', id: 'A-ORDER-1' }, token) // => 对应的订单详情
 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string): unknown {
  const shopId = String(data.shopId)
  const { visible, record: order } = getOrderRecord(token, shopId, data.id)
  if (endpoint === endpoints.detail)
    return visible
  if (endpoint === endpoints.print) {
    authorize(token, shopId, 'order.amount.read')
    return { jobId: `TEST-PRINT-${Date.now()}`, simulated: true }
  }
  if (endpoint !== endpoints.action)
    throw new Error('未知订单操作')
  if (data.action === 'collect') {
    authorize(token, shopId, 'order.cashier.collect')
    authorize(token, shopId, 'order.amount.read')
    if (!order.cashier || order.version !== data.version || order.paymentStatus !== 'unpaid' || order.status === 5 || order.status === 6)
      throw new Error('当前订单状态不允许此操作')
    order.paymentStatus = 'paid'
    order.version++
    order.timeline.push({ t: new Date().toISOString(), s: '已收款', done: true })
    return { accepted: true }
  }
  const rules: Record<string, { permission: string, from: number, to: ShopOrder['status'] }> = { accept: { permission: 'order.accept', from: 1, to: 2 }, prepare: { permission: 'order.prepare', from: 2, to: 3 }, cancel: { permission: 'order.cancel', from: 1, to: 5 }, serve: { permission: 'order.serve', from: 3, to: 4 }, pickup: { permission: 'order.pickup.verify', from: 3, to: 4 } }
  const rule = rules[String(data.action)]
  if (!rule)
    throw new Error('不支持的订单动作')
  authorize(token, shopId, rule.permission)
  if (order.version !== data.version)
    throw new Error('订单已更新，请刷新后重试')
  if (order.status !== rule.from || (data.action === 'serve' && order.type !== '堂食') || (data.action === 'pickup' && order.type !== '自取'))
    throw new Error('当前订单状态不允许此操作')
  if (data.action === 'pickup' && order.pickupVerificationRequired && data.verificationCode !== '6142')
    throw new Error('核销码错误')
  order.status = rule.to
  order.statusText = SHOP_ORDER_STATUS[rule.to].text
  order.version++
  order.timeline.push({ t: new Date().toISOString(), s: order.statusText, done: true })
  const shop = authorize(token, shopId, 'order.read')
  return JSON.parse(JSON.stringify(hasShopPermission(shop, 'order.amount.read') ? order : withoutOrderAmounts(order)))
}
