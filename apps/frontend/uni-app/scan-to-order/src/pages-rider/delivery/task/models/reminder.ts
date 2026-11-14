/**
 * ============================================================================
 * 【文件概述】配送任务的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderReminderPreference：账号隔离的语音与震动布尔偏好，缺省两项均关闭。
 * - isReminderPreference：校验持久化提醒偏好，拒绝非布尔值。
 * 【综合使用示例】
 * import type { RiderReminderPreference } from '@/pages-rider/delivery/task/models/reminder'
 * const value: RiderReminderPreference = { enabled: false, vibrate: false }
 * ============================================================================
 */
/**
 * 账号隔离的语音与震动布尔偏好，缺省两项均关闭。
 * @example const value: RiderReminderPreference = { enabled: false, vibrate: false }
 */
export interface RiderReminderPreference { enabled: boolean, vibrate: boolean }
/**
 * 校验持久化提醒偏好，拒绝非布尔值。
 * @param value {unknown} 待校验的外部数据或路由参数
 * @returns boolean，且为 ReminderPreference 的类型守卫。
 * @example isReminderPreference({ enabled: false, vibrate: true }) // true
 */
export function isReminderPreference(value: unknown): value is RiderReminderPreference {
  if (!value || typeof value !== 'object')
    return false
  const data = value as RiderReminderPreference
  return typeof data.enabled === 'boolean' && typeof data.vibrate === 'boolean'
}
