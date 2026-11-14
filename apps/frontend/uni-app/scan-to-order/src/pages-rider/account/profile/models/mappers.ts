/**
 * ============================================================================
 * 【文件概述】骑手资料的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - isRiderAccountProfile：检查资料、版本、服务门店和站点结构。
 * - toRiderProfile：拒绝不完整资料响应，保留正确的领域类型。
 * 【综合使用示例】
 * import { isRiderAccountProfile } from '@/pages-rider/account/profile/models/mappers'
 * isRiderAccountProfile(null) // false
 * ============================================================================
 */
import type { RiderAccountProfile } from './types'

/**
 * 检查资料、版本、服务门店和站点结构。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns boolean，同时作为 RiderAccountProfile 的类型守卫。
 * @example isRiderAccountProfile(null) // false
 */
export function isRiderAccountProfile(value: unknown): value is RiderAccountProfile {
  if (!value || typeof value !== 'object')
    return false
  const data = value as RiderAccountProfile
  return typeof data.id === 'string' && !!data.id && typeof data.name === 'string' && typeof data.phone === 'string'
    && typeof data.joinedAt === 'string' && Number.isSafeInteger(data.version) && data.version > 0
    && Array.isArray(data.serviceShops) && data.serviceShops.every(s => !!s && typeof s.id === 'string' && typeof s.name === 'string')
    && !!data.station && typeof data.station.name === 'string' && typeof data.station.contactName === 'string' && typeof data.station.phone === 'string' && typeof data.station.isDemo === 'boolean'
}

/**
 * 拒绝不完整资料响应，保留正确的领域类型。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns RiderAccountProfile；不完整资料抛错。
 * @example toRiderProfile(null) // 抛出骑手资料无效
 */
export function toRiderProfile(value: unknown): RiderAccountProfile {
  if (!isRiderAccountProfile(value))
    throw new Error('骑手资料无效')
  return value
}
