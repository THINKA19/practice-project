/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - toRiderGrant：验证授权结构并复制权限列表，防止非法响应进入权限状态。
 * 【综合使用示例】
 * import { toRiderGrant } from '@/pages-rider/auth/permissions/models/mappers'
 * toRiderGrant({ riderId: '1', qualified: false, permissions: [] }).qualified // false
 * ============================================================================
 */
import type { RiderGrant } from './types'

/**
 * 验证授权结构并复制权限列表，防止非法响应进入权限状态。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns RiderGrant，复制后的有效授权；无效结构抛出错误。
 * @example toRiderGrant({ riderId: '1', qualified: false, permissions: [] }).qualified // false
 */
export function toRiderGrant(value: unknown): RiderGrant {
  const data = value as RiderGrant | null
  if (!data || typeof data.riderId !== 'string' || !data.riderId || typeof data.qualified !== 'boolean' || !Array.isArray(data.permissions) || !data.permissions.every(item => typeof item === 'string'))
    throw new Error('骑手权限数据无效')
  return { riderId: data.riderId, qualified: data.qualified, permissions: [...data.permissions] }
}
