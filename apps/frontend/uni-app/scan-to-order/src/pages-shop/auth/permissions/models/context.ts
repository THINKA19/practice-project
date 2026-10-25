export interface MerchantShop {
  id: string
  merchantId: string
  name: string
  soundNotify: boolean
  roleTemplate: 'owner' | 'employee'
  permissions: string[]
  grantVersion: number
}
export interface ShopRequestContext {
  token: string
  shopId: string
  revision: number
}
export function isMerchantShop(value: unknown): value is MerchantShop {
  if (!value || typeof value !== 'object')
    return false

  const item = value as Record<string, unknown>

  return typeof item.id === 'string' && !!item.id && typeof item.merchantId === 'string' && !!item.merchantId && typeof item.name === 'string' && typeof item.soundNotify === 'boolean'
    && ['owner', 'employee'].includes(String(item.roleTemplate)) && Number.isSafeInteger(item.grantVersion)
    && Array.isArray(item.permissions) && item.permissions.every(p => typeof p === 'string')
}
