/**
 * ============================================================================
 * 【文件概述】配送任务的无框架依赖的纯业务规则层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - createRiderReminderTracker：创建首帧抑制与新任务去重器；重置后重新建立基线。
 * 【综合使用示例】
 * import { createRiderReminderTracker } from '@/pages-rider/delivery/task/domain/reminder.rules'
 * createRiderReminderTracker().inspect([], '1', true) // ''
 * ============================================================================
 */
import { t } from '@/locale'
import type { RiderOrder } from '../models/types'
/**
 * 创建首帧抑制与新任务去重器；重置后重新建立基线。
 * 无参数。
 * @returns 带 inspect 和 reset 的事件去重器；首帧 inspect 返回空文本。
 * @example createRiderReminderTracker().inspect([], '1', true) // ''
 */
export function createRiderReminderTracker() {
  let baseline = false
  const seen = new Set<string>()
  function inspect(orders: RiderOrder[], riderId: string, online: boolean): string {
    const candidates = orders.filter(order => (order.status === 'pending' && !order.riderId) || (order.status === 'assigned' && order.riderId === riderId))
    const current = new Set<string>()
    let message = ''
    for (const order of candidates) {
      const key = order.status === 'assigned' ? `${order.id}:assigned:${order.version}` : `${order.id}:pending`
      current.add(key)
      if (seen.has(key))
        continue
      seen.add(key)
      if (baseline && (order.status === 'assigned' || online))
        message = t(order.status === 'assigned' ? 'rider.settings.assignedAlert' : 'rider.settings.newAlert', { shop: order.shopName })
    }
    baseline = true
    for (const key of seen) {
      if (seen.size <= 1000)
        break
      if (!current.has(key))
        seen.delete(key)
    }
    return message
  }
  function reset() {
    baseline = false
    seen.clear()
  }
  return { inspect, reset }
}
