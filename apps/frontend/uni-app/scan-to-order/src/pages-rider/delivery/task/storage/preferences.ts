/**
 * ============================================================================
 * 【文件概述】配送任务的账号隔离的偏好持久化层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderReminderPreferences：按环境、服务地址与账号隔离提醒偏好；不保存凭证或任务。
 * 【综合使用示例】
 * import { useRiderReminderPreferences } from '@/pages-rider/delivery/task/storage/preferences'
 * useRiderReminderPreferences().read('demo/account-1') // 未设置时关闭语音与震动
 * ============================================================================
 */
import { defineStore } from 'pinia'
import { isReminderPreference } from '../models/reminder'
import type { RiderReminderPreference } from '../models/reminder'
/**
 * 按环境、服务地址与账号隔离提醒偏好；不保存凭证或任务。
 * 无参数；须在已安装 Pinia 的应用中调用。
 * @returns 当前 Pinia 实例中本领域的状态与操作。
 * @example useRiderReminderPreferences().read('demo/account-1') // 未设置时关闭语音与震动
 */
export const useRiderReminderPreferences = defineStore('rider-reminder-preferences-v1', {
  state: () => ({ accounts: {} as Record<string, RiderReminderPreference> }),
  actions: {
    read(key: string): RiderReminderPreference {
      const value = this.accounts?.[key]
      return isReminderPreference(value) ? { ...value } : { enabled: false, vibrate: false }
    },
    write(key: string, value: RiderReminderPreference) {
      if (!key || !isReminderPreference(value))
        return
      const records = this.accounts && typeof this.accounts === 'object' && !Array.isArray(this.accounts) ? this.accounts : {}
      this.accounts = { ...records, [key]: { ...value } }
    },
  },
  persist: true,
})
