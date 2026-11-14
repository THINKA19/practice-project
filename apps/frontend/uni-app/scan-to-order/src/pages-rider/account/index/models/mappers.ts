/**
 * ============================================================================
 * 【文件概述】个人中心的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - toRiderAccount：验证账户等级、非负累计单量及可空的 0～5 评分。
 * 【综合使用示例】
 * import { toRiderAccount } from '@/pages-rider/account/index/models/mappers'
 * toRiderAccount({ level: '配送员', rating: null, completedCount: 0 }).rating // null
 * ============================================================================
 */
import type { RiderAccountOverview } from './types'
/**
 * 验证账户等级、非负累计单量及可空的 0～5 评分。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns RiderAccountOverview；字段无效时抛出概览错误。
 * @example toRiderAccount({ level: '配送员', rating: null, completedCount: 0 }).rating // null
 */
export function toRiderAccount(value: unknown): RiderAccountOverview {
  const data = value as RiderAccountOverview | null
  if (!data || typeof data.level !== 'string' || !Number.isSafeInteger(data.completedCount) || data.completedCount < 0 || !(data.rating === null || (Number.isFinite(data.rating) && data.rating >= 0 && data.rating <= 5)))
    throw new Error('个人中心概览无效')
  return { level: data.level, rating: data.rating, completedCount: data.completedCount }
}
