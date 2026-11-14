/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - validateRules：验证接单上限、指派超时秒数和规则文本。
 * - settingsSection：将页面参数收敛为规则或提醒页签。
 * 【综合使用示例】
 * import { validateRules } from '@/pages-rider/account/settings/models/mappers'
 * validateRules(null) // 抛出接单规则无效
 * ============================================================================
 */
import type { RiderRules, RiderSettingsSection } from './types'

/**
 * 验证接单上限、指派超时秒数和规则文本。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns RiderRules；非法字段抛错，页面保留可重试提示。
 * @example validateRules(null) // 抛出接单规则无效
 */
export function validateRules(value: unknown): RiderRules {
  const data = value as RiderRules | null
  if (!data || !Number.isSafeInteger(data.maxConcurrent) || data.maxConcurrent <= 0 || !Number.isSafeInteger(data.assignmentTimeoutSeconds) || data.assignmentTimeoutSeconds < 0 || !Array.isArray(data.serviceShops) || !data.serviceShops.every(s => s && typeof s.id === 'string' && typeof s.name === 'string') || !Array.isArray(data.rules) || !data.rules.every(r => typeof r === 'string'))
    throw new Error('接单规则无效')
  return data
}

/**
 * 将页面参数收敛为规则或提醒页签。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns RiderSettingsSection；未知参数回退 rules。
 * @example settingsSection('reminders') // 'reminders'
 */
export function settingsSection(value: unknown): RiderSettingsSection {
  return value === 'reminders' ? 'reminders' : 'rules'
}
