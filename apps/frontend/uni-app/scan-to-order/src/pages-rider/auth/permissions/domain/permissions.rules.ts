import type { RiderGrant } from '../models/types'
/** 身份、服务端资格和具体权限必须同时满足。 */
export function canRiderOperate(identity: string | null, grant: RiderGrant | null, permission: string): boolean {
  return identity === 'rider' && !!grant?.riderId && grant.qualified === true && grant.permissions.includes(permission)
}
