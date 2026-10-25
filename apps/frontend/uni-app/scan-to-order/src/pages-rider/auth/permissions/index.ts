/**
 * 【文件概述】骑手资格与操作权限规则；权限资料必须由服务端提供。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
export interface RiderGrant {
  riderId: string
  qualified: boolean
  permissions: readonly string[]
}
/** 身份匹配、资格有效且具有具体操作权限才允许操作。 */
export function canRiderOperate(identity: string | null, grant: RiderGrant | null, permission: string): boolean {
  return identity === 'rider' && !!grant?.riderId && grant.qualified === true && grant.permissions.includes(permission)
}
