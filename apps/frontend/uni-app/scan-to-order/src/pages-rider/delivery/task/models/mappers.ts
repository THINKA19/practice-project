/**
 * ============================================================================
 * 【文件概述】配送任务的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - isRiderOrder：验证任务状态、版本、金额和时间，防止损坏统计。
 * - validateSnapshot：整体验证任务快照及唯一 id，失败时不替换现有投影。
 * 【综合使用示例】
 * import { isRiderOrder } from '@/pages-rider/delivery/task/models/mappers'
 * isRiderOrder(null) // false
 * ============================================================================
 */
import type { RiderOrder, RiderPoint, RiderServiceArea, RiderTaskSnapshot } from './types'

function isServiceArea(area: RiderServiceArea): boolean {
  if (!area || !/^[A-Z]{2}$/.test(area.countryCode) || !/^[A-Z]{3}$/.test(area.currency)
    || ![area.cityId, area.zoneId, area.label, area.timeZone].every(value => typeof value === 'string' && value.trim())) {
    return false
  }
  try {
    return Boolean(new Intl.DateTimeFormat('en', { timeZone: area.timeZone }).resolvedOptions().timeZone)
  }
  catch {
    return false
  }
}

function isPoint(point?: RiderPoint): boolean {
  return point === undefined || (!!point && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180)
}

/**
 * 验证任务状态、版本、金额和时间，防止损坏统计。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns boolean，同时作为 RiderOrder 的类型守卫。
 * @example isRiderOrder(null) // false
 */
export function isRiderOrder(value: unknown): value is RiderOrder {
  if (!value || typeof value !== 'object')
    return false
  const task = value as RiderOrder
  const strings = ['id', 'orderId', 'shopId', 'riderId', 'shopAddress', 'exception', 'statusText', 'shopName', 'distance', 'address', 'customer', 'phone', 'goodsSummary', 'expectTime'] as const
  return strings.every(key => typeof task[key] === 'string') && !!task.id
    && [task.pickupNote, task.deliveryArea, task.deliveryNote].every(value => value === undefined || typeof value === 'string')
    && ['pending', 'assigned', 'accepted', 'delivering', 'done', 'cancelled'].includes(task.status)
    && Number.isSafeInteger(task.version) && task.version > 0
    && [task.amount, task.deliveryFee].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0)
    && (task.serviceArea === undefined || isServiceArea(task.serviceArea))
    && isPoint(task.pickupPoint) && isPoint(task.deliveryPoint)
    && (task.pickupCode === undefined || typeof task.pickupCode === 'string')
    && (task.itemCount === undefined || (Number.isSafeInteger(task.itemCount) && task.itemCount >= 0))
    && (task.shopPhone === undefined || typeof task.shopPhone === 'string')
    && typeof task.createdAt === 'string' && Number.isFinite(Date.parse(task.createdAt))
    && (task.deliveryDistanceKm === undefined || (Number.isFinite(task.deliveryDistanceKm) && task.deliveryDistanceKm >= 0))
    && [task.acceptAt, task.settledAt, task.assignmentExpiresAt, task.deliverBy, task.pickedUpAt, task.deliveredAt, task.cancelledAt].every(date => date === undefined || (typeof date === 'string' && Number.isFinite(Date.parse(date))))
}

/**
 * 整体验证任务快照及唯一 id，失败时不替换现有投影。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns RiderTaskSnapshot；任一任务或快照字段无效时抛错。
 * @example validateSnapshot(null) // 抛出配送任务数据无效
 */
export function validateSnapshot(value: unknown, requireArea = false): RiderTaskSnapshot {
  const data = value as RiderTaskSnapshot | null
  if (!data || !Array.isArray(data.tasks) || !data.tasks.every(isRiderOrder)
    || new Set(data.tasks.map(task => task.id)).size !== data.tasks.length
    || typeof data.online !== 'boolean' || typeof data.riderId !== 'string' || !data.riderId
    || !Number.isSafeInteger(data.maxConcurrent) || data.maxConcurrent < 1) {
    throw new Error('配送任务数据无效，请刷新重试')
  }
  const area = data.serviceArea
  if ((requireArea && area === undefined) || (area != null && !isServiceArea(area)))
    throw new Error('配送服务区数据无效，请联系站点管理员')
  if (area !== undefined && ((data.online && !area) || data.tasks.some((task) => {
    if (!task.serviceArea)
      return true
    if (task.status !== 'pending' && task.riderId !== data.riderId)
      return true
    if (task.status !== 'pending' && task.status !== 'assigned')
      return false
    return !data.online || !area || task.serviceArea.countryCode !== area.countryCode || task.serviceArea.cityId !== area.cityId || task.serviceArea.zoneId !== area.zoneId
  }))) {
    throw new Error('配送任务超出当前服务范围')
  }
  return data
}
