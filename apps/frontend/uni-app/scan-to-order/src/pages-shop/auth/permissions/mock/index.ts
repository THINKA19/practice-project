import { sessionState } from '@/pages/auth/session/mock'
import type { MerchantShop } from '../models/types'
import { disabledStaffAccounts, staffForShop } from '@/pages-shop/staff/index/mock'
import { savedShopOverview } from '@/pages-shop/shop/index/mock'
import { hasShopPermission, isStaffPermission } from '../models/policy'

const permissions = ['order.read', 'order.amount.read', 'order.accept', 'order.prepare', 'order.serve', 'order.pickup.verify', 'order.cancel', 'booking.read', 'booking.manage', 'order.cashier.collect', 'table.read', 'table.manage', 'goods.read', 'goods.edit', 'delivery.read', 'delivery.dispatch', 'statistics.read', 'shop.settings.manage', 'staff.read', 'staff.manage']
/** 验证测试身份。@param token 凭证 @returns 用户编号 @example owner(token) // 有效测试商家 */
export function owner(token: string) { const user = sessionState.profile(token); if (!user || user.identity !== 'shop') throw new Error('请先登录商家测试账号'); return String(user.userId) }
/** 返回门店独立副本。@param token 凭证 @returns 授权列表 @example shops(token) // 两个测试门店 */
export function shops(token: string): MerchantShop[] {
  const accountId = owner(token)
  if (disabledStaffAccounts.has(accountId))
    return []
  const result: MerchantShop[] = []
  for (const id of ['A', 'B']) {
    const countryCode: MerchantShop['countryCode'] = id === 'A' ? 'VN' : 'TH'
    const base = { id, countryCode, merchantId: 'demo-merchant', name: id === 'A' ? '测试门店 · 中心店' : '测试门店 · 分店', soundNotify: savedShopOverview(id)?.soundNotify ?? true }
    if (accountId === '20001') {
      result.push({ ...base, roleTemplate: 'owner', permissions: [...permissions], grantVersion: 1 })
      continue
    }
    const member = staffForShop(id).find(member => member.id === accountId && member.enabled)
    const grant = member?.grants.find(grant => grant.shopId === id)
    if (grant)
      result.push({ ...base, roleTemplate: 'employee', permissions: grant.permissions.filter(isStaffPermission), grantVersion: grant.version })
  }
  return result
}
/** 校验门店操作权限。@param token 凭证 @param shopId 门店 @param permission 权限 @returns 授权门店 @example authorize(token, 'A', 'order.read') // 授权或抛错 */
export function authorize(token: string, shopId: unknown, permission: string) { const shop = shops(token).find(s => s.id === shopId); if (!shop || !hasShopPermission(shop, permission)) throw new Error('没有当前门店操作权限'); return shop }
