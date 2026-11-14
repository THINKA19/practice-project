import type { MerchantShop } from './types'

const staffPermissions = new Set([
  'order.read',
  'order.accept',
  'order.prepare',
  'order.serve',
  'order.pickup.verify',
  'table.read',
  'table.manage',
  'delivery.read',
  'delivery.dispatch',
])

export function isStaffPermission(permission: string) {
  return staffPermissions.has(permission)
}

// Existing owner grants use table.manage for configuration as well as service.
export function hasShopPermission(shop: MerchantShop, permission: string) {
  return (shop.roleTemplate === 'owner' || isStaffPermission(permission))
    && shop.permissions.includes(permission === 'table.configure' ? 'table.manage' : permission)
}
