/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的无框架依赖的纯业务规则层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - canRiderOperate：同时检查骑手身份、资格和具体权限，不替代服务端授权。
 * 【综合使用示例】
 * import { canRiderOperate } from '@/pages-rider/auth/permissions/domain/permissions.rules'
 * canRiderOperate('rider', null, 'task.grab') // false
 * ============================================================================
 */
import type { RiderGrant } from '../models/types'
/**
 * 同时检查骑手身份、资格和具体权限，不替代服务端授权。
 * @param identity {string | null} 共享会话身份
 * @param grant {RiderGrant | null} 服务端资格与权限
 * @param permission {string} 待执行动作的权限项
 * @returns boolean，只有身份、资格和具体权限都满足时为 true。
 * @example canRiderOperate('rider', null, 'task.grab') // false
 */
export function canRiderOperate(identity: string | null, grant: RiderGrant | null, permission: string): boolean {
  return identity === 'rider' && !!grant?.riderId && grant.qualified === true && grant.permissions.includes(permission)
}
