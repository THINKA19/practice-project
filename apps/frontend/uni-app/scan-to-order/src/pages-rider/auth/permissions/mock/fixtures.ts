/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - createGrant：创建账号专属的演示授权列表，每次返回独立数组。
 * 【综合使用示例】
 * import { createGrant } from '@/pages-rider/auth/permissions/mock/fixtures'
 * createGrant('1').permissions.includes('task.grab') // true
 * ============================================================================
 */
import type { RiderGrantDto } from '../api/permissions.dto'
/**
 * 创建账号专属的演示授权列表，每次返回独立数组。
 * @param riderId {string} 当前骑手标识
 * @returns RiderGrantDto，当前演示账号的资格与独立权限数组。
 * @example createGrant('1').permissions.includes('task.grab') // true
 */
export function createGrant(riderId: string): RiderGrantDto {
  return { riderId, qualified: true, permissions: ['online.change', 'task.grab', 'task.accept', 'task.reject', 'task.pickup', 'task.finish', 'task.release', 'task.exception'] }
}
