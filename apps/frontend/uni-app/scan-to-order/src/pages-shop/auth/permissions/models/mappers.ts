import type { MerchantShop } from './types'

/** 校验门店及其权限列表、角色模板和授权版本，拒绝不完整的授权资料。 */
export function isMerchantShop(value: unknown): value is MerchantShop {
  if (!value || typeof value !== 'object')
    return false

  const item = value as Record<string, unknown>

  return typeof item.id === 'string' && !!item.id && typeof item.merchantId === 'string' && !!item.merchantId && typeof item.name === 'string' && typeof item.soundNotify === 'boolean'
    && ['owner', 'employee'].includes(String(item.roleTemplate)) && Number.isSafeInteger(item.grantVersion)
    && Array.isArray(item.permissions) && item.permissions.every(p => typeof p === 'string')
}
