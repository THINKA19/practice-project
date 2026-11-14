/**
 * ============================================================================
 * 【文件概述】骑手资料的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - createProfile：创建账号独立的演示资料，站点标记为演示以防误拨。
 * 【综合使用示例】
 * import { createProfile } from '@/pages-rider/account/profile/mock/fixtures'
 * createProfile('1', '骑手').name // '骑手'
 * ============================================================================
 */
import type { RiderAccountProfile } from '../models/types'

/**
 * 创建账号独立的演示资料，站点标记为演示以防误拨。
 * @param id {string} 模拟骑手标识
 * @param name {string} 骑手展示姓名
 * @returns RiderAccountProfile，版本为 1 的独立演示资料。
 * @example createProfile('1', '骑手').name // '骑手'
 */
export function createProfile(id: string, name: string): RiderAccountProfile {
  return { id, name: name === '模拟骑手' ? '配送员' : name, phone: '13800000000', joinedAt: '2026-01-01', version: 1, serviceShops: [{ id: 'demo-shop', name: '禾味厨房' }], station: { name: '城东配送站', contactName: '值班站长', phone: '13800000000', isDemo: true } }
}
