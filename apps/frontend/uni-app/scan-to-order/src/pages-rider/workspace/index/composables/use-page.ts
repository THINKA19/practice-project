/**
 * ============================================================================
 * 【文件概述】骑手工作台的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderWorkspacePage：装配工作台配置、资料和任务动作，各模块保持自己的数据所有权。
 * 【综合使用示例】
 * import { useRiderWorkspacePage } from '@/pages-rider/workspace/index/composables/use-page'
 * const page = useRiderWorkspacePage() // 在页面 setup 中绑定公告和任务
 * ============================================================================
 */
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { incomeProgress } from '../models/presentation'
import { useRiderWorkspaceOverview } from './use-overview'
import { computed } from 'vue'
import { useRiderProfileStore } from '@/pages-rider/account/profile'
import { useRiderLoginAuth } from '@/pages-rider/auth/login'
import { useRiderTaskActions, useRiderTaskRefresh, useRiderTaskReminders, useRiderTaskStore } from '@/pages-rider/delivery/task'

/**
 * 装配工作台配置、资料和任务动作，各模块保持自己的数据所有权。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const page = useRiderWorkspacePage() // 在页面 setup 中绑定公告和任务
 */
export function useRiderWorkspacePage() {
  useRiderTaskRefresh()
  const overview = useRiderWorkspaceOverview()
  const store = useRiderTaskStore()
  const reminders = useRiderTaskReminders()
  const { latest, message, enabled } = storeToRefs(reminders)
  const state = storeToRefs(store)
  const { profile: basicProfile, logout, goBackClient } = useRiderLoginAuth()
  const account = useRiderProfileStore()
  const profile = computed(() => account.profile || basicProfile.value)
  onShow(() => {
    void account.refresh()
    void overview.refresh()
  })
  onPullDownRefresh(async () => {
    try {
      await Promise.all([store.refresh(), overview.refresh()])
    }
    finally {
      uni.stopPullDownRefresh()
    }
  })
  const actions = useRiderTaskActions()
  function toggleOnline() {
    if (!store.online)
      reminders.prepareAudio()
    return actions.toggleOnline()
  }
  return { ...state, ...actions, toggleOnline, profile, logout, goBackClient, latest, reminderMessage: message, reminderEnabled: enabled, toggleReminder: reminders.toggle, announcement: computed(() => overview.overview.value?.announcement || ''), overviewError: overview.error, refreshOverview: overview.refresh, target: computed(() => overview.overview.value?.incomeTarget ?? null), progress: computed(() => incomeProgress(store.stats.todayIncome, overview.overview.value?.incomeTarget ?? null)), refresh: store.refresh }
}
