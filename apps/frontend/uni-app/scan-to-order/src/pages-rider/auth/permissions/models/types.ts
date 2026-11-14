/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderGrant：服务端骑手授权；riderId 必须匹配当前账号，qualified 与具体权限共同决定准入。
 * 【综合使用示例】
 * import type { RiderGrant } from '@/pages-rider/auth/permissions/models/types'
 * const canAccept = (grant: RiderGrant) => grant.qualified && grant.permissions.includes('task.accept')
 * ============================================================================
 */
/**
 * 服务端骑手授权；riderId 必须匹配当前账号，qualified 与具体权限共同决定准入。
 * @example const canAccept = (grant: RiderGrant) => grant.qualified && grant.permissions.includes('task.accept')
 */
export interface RiderGrant {
  riderId: string
  qualified: boolean
  permissions: readonly string[]
}
