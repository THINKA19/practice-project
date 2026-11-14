import { authorize, owner } from '@/pages-shop/auth/permissions/mock'
import { isStaffPermission } from '@/pages-shop/auth/permissions/models/policy'
import { endpoints } from '../api/endpoints'
import { defaultStaffPermissions, disabledStaffAccounts, staffByShop, staffForShop } from './state'
export { disabledStaffAccounts, staffForShop } from './state'

const invitations = new Map<string, { shopId: string, expiresAt: number }>()
let inviteSequence = 0
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value))
/** 员工授权模拟契约。@param endpoint 路径 @param data 参数 @param token 凭证 @returns 授权列表或确认 @example handle(endpoints.list, {shopId:'A'}, token) // 员工列表 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string): unknown {
  const shopId = String(data.shopId); const shop = authorize(token, shopId, endpoint === endpoints.list ? 'staff.read' : 'staff.manage')
  const staff = staffForShop(shopId)
  if (endpoint === endpoints.list) return copy({ permissions: shop.permissions.filter(isStaffPermission), staff })
  if (endpoint === endpoints.invite) {
    const code = `TEST-${shopId}-${Date.now()}-${++inviteSequence}`
    invitations.set(code, { shopId, expiresAt: Date.now() + 86_400_000 })
    return { code }
  }
  const member = staff.find(m => m.id === data.id); const grant = member?.grants.find(g => g.shopId === shopId)
  if (!member || !grant || grant.version !== data.version || grant.roleTemplate === 'owner') throw new Error('员工授权已更新，请刷新')
  if (endpoint === endpoints.remove) { staff.splice(staff.indexOf(member), 1); return null }
  if (endpoint !== endpoints.update) throw new Error('未知员工管理操作')
  const permissions: unknown = JSON.parse(String(data.permissions))
  if (!Array.isArray(permissions) || !permissions.every(p => typeof p === 'string' && shop.permissions.includes(p) && isStaffPermission(p)) || typeof data.enabled !== 'boolean') throw new Error('员工权限无效')
  grant.permissions = permissions
  grant.version++
  if (data.enabled)
    disabledStaffAccounts.delete(member.id)
  else
    disabledStaffAccounts.add(member.id)

  for (const members of staffByShop.values()) {
    const account = members.find(candidate => candidate.id === member.id)
    if (account && account.enabled !== data.enabled) {
      account.enabled = data.enabled
      if (account !== member)
        account.grants.forEach(grant => grant.version++)
    }
  }
  return copy(member)
}
/** 消费一次性测试邀请。@param token 凭证 @param code 邀请码 @returns void @example acceptInvite(token, code) // 已消费或抛错 */
export function acceptInvite(token: string, code: string) {
  const accountId = owner(token)
  const invitation = invitations.get(code)
  if (!invitation || invitation.expiresAt <= Date.now())
    throw new Error('邀请码无效或已使用')
  if (accountId === '20001')
    throw new Error('请使用员工测试账号接受邀请')
  if (disabledStaffAccounts.has(accountId))
    throw new Error('员工账号已停用')
  const { shopId } = invitation
  const staff = staffForShop(shopId)
  if (staff.some(member => member.id === accountId))
    throw new Error('该账号已有本店员工记录，请联系老板管理授权')
  staff.push({
    id: accountId,
    username: 'shop-staff',
    name: '受邀员工',
    enabled: true,
    grants: [{ accountId, shopId, roleTemplate: 'employee', permissions: [...defaultStaffPermissions], version: 1 }],
  })
  invitations.delete(code)
}
/** 清空员工和邀请。无参数。@returns void @example reset() // 清空 */
export function reset() {
  staffByShop.clear()
  disabledStaffAccounts.clear()
  invitations.clear()
}
