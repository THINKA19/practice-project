/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderRules：接单规则快照；并发上限为正整数，指派超时以秒计，零表示本样本不自动超时。
 * - RiderSettingsSection：设置页有效区域，仅规则说明和提醒设置两个入口。
 * 【综合使用示例】
 * import type { RiderRules } from '@/pages-rider/account/settings/models/types'
 * const limit = (rules: RiderRules) => rules.maxConcurrent
 * ============================================================================
 */
/**
 * 接单规则快照；并发上限为正整数，指派超时以秒计，零表示本样本不自动超时。
 * @example const limit = (rules: RiderRules) => rules.maxConcurrent
 */
export interface RiderRules { maxConcurrent: number, assignmentTimeoutSeconds: number, serviceShops: { id: string, name: string }[], rules: string[] }
/**
 * 设置页有效区域，仅规则说明和提醒设置两个入口。
 * @example const section: RiderSettingsSection = 'reminders'
 */
export type RiderSettingsSection = 'rules' | 'reminders'
