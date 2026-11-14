/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的跨模块公开入口。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderPermissionsStore：所属模块的公开能力。
 * - canRiderOperate：所属模块的公开能力。
 * 【综合使用示例】
 * import { useRiderPermissionsStore } from '@/pages-rider/auth/permissions/index'
 * // 调用约束与参数见该导出的实现声明。
 * ============================================================================
 */
export { useRiderPermissionsStore } from './composables/use-store'
export { canRiderOperate } from './domain/permissions.rules'

export type { RiderGrant } from './models/types'
