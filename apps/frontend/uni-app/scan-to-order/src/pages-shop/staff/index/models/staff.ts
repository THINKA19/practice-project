export interface StaffGrant { accountId: string, shopId: string, roleTemplate: 'owner' | 'employee', permissions: string[], version: number }
export interface StaffMember { id: string, username: string, name: string, enabled: boolean, grants: StaffGrant[] }
export interface StaffList { permissions: string[], staff: StaffMember[] }
export const permissionLabels: Record<string, string> = {
  'order.read': '查看履约订单',
  'order.accept': '接单',
  'order.prepare': '完成出餐',
  'order.serve': '确认上菜',
  'order.pickup.verify': '自取核销',
  'table.read': '查看桌台',
  'table.manage': '开台与清台',
  'delivery.read': '查看配送',
  'delivery.dispatch': '派单',
}
