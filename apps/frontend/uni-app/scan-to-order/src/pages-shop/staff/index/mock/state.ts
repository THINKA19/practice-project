import type { StaffMember } from '../models/staff'

export const defaultStaffPermissions = ['order.read', 'order.accept', 'order.prepare', 'order.serve', 'order.pickup.verify', 'table.read', 'table.manage']

export const disabledStaffAccounts = new Set<string>()

export const staffByShop = new Map<string, StaffMember[]>()

export function staffForShop(shopId: string) {
  let staff = staffByShop.get(shopId)
  if (!staff) {
    const id = `${shopId}-E1`
    staff = [{
      id,
      username: 'test-staff',
      name: '测试员工',
      enabled: true,
      grants: [{ accountId: id, shopId, roleTemplate: 'employee', permissions: ['order.read'], version: 1 }],
    }]
    if (shopId === 'A') {
      staff.push({
        id: '20002',
        username: 'shop-staff',
        name: '演示员工',
        enabled: true,
        grants: [{ accountId: '20002', shopId, roleTemplate: 'employee', permissions: [...defaultStaffPermissions], version: 1 }],
      })
    }
    staffByShop.set(shopId, staff)
  }
  return staff
}
