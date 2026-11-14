/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderSettingsPage：装配规则说明与声音、震动设置，复用任务提醒模块。
 * 【综合使用示例】
 * import { useRiderSettingsPage } from '@/pages-rider/account/settings/composables/use-page'
 * const page = useRiderSettingsPage() // 在设置页 setup 中绑定规则与开关
 * ============================================================================
 */
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRiderLoginAuth } from '@/pages-rider/auth/login'
import { useRiderTaskRefresh, useRiderTaskReminders, useRiderTaskStore } from '@/pages-rider/delivery/task'
import type { RiderSettingsSection } from '../models/types'
import { settingsSection } from '../models/mappers'
import { useRiderSettingsRules } from './use-rules'

/**
 * 装配规则说明与声音、震动设置，复用任务提醒模块。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const page = useRiderSettingsPage() // 在设置页 setup 中绑定规则与开关
 */
export function useRiderSettingsPage() {
  useRiderTaskRefresh()
  const { online, maxConcurrent } = storeToRefs(useRiderTaskStore())
  const { ensureLogin, logout } = useRiderLoginAuth()
  const reminders = useRiderTaskReminders()
  const { enabled, vibrate, message, latest } = storeToRefs(reminders)
  const data = useRiderSettingsRules()
  const section = ref<RiderSettingsSection>('rules')
  onLoad((query) => {
    section.value = settingsSection(query?.section)
  })
  onShow(() => {
    if (ensureLogin())
      void data.refresh()
  })
  return { online, maxConcurrent, logout, section, ...data, enabled, vibrate, message, latest, toggle: reminders.toggle, toggleVibrate: reminders.toggleVibrate, preview: reminders.preview }
}
