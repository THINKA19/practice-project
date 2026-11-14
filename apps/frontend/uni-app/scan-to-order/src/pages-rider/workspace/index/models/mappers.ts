/**
 * ============================================================================
 * 【文件概述】骑手工作台的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - toRiderWorkspace：验证公告文本与正数或空参考目标，未知目标不伪造数值。
 * 【综合使用示例】
 * import { toRiderWorkspace } from '@/pages-rider/workspace/index/models/mappers'
 * toRiderWorkspace({ announcement: '', incomeTarget: null }).incomeTarget // null
 * ============================================================================
 */
import type { RiderWorkspaceOverview } from './types'

/**
 * 验证公告文本与正数或空参考目标，未知目标不伪造数值。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns RiderWorkspaceOverview；字段无效时抛出配置错误。
 * @example toRiderWorkspace({ announcement: '', incomeTarget: null }).incomeTarget // null
 */
export function toRiderWorkspace(value: unknown): RiderWorkspaceOverview {
  const data = value as RiderWorkspaceOverview | null
  if (!data || typeof data.announcement !== 'string' || !(data.incomeTarget === null || (Number.isFinite(data.incomeTarget) && data.incomeTarget > 0)))
    throw new Error('工作台配置无效')
  return { announcement: data.announcement, incomeTarget: data.incomeTarget }
}
