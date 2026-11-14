/**
 * ============================================================================
 * 【文件概述】个人中心的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderAccountPage：装配个人中心概览、资料、今日任务统计与导航入口。
 * 【综合使用示例】
 * import { useRiderAccountPage } from '@/pages-rider/account/index/composables/use-page'
 * const page = useRiderAccountPage() // 在页面 setup 中绑定菜单与概览
 * ============================================================================
 */
import { t } from '@/locale'
import { useRiderAccountOverview } from './use-overview'
import type { RiderSettingItem } from '../models/types'
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { riderIncomeAmounts, useRiderTaskRefresh, useRiderTaskStore } from '@/pages-rider/delivery/task'

import { useRiderLoginAuth } from '@/pages-rider/auth/login'
import { useRiderAccountContact } from './use-contact'
import { navigate as go } from '@/utils/project/navigation'
import { RiderRoutes } from '@/pages-rider/routes'
import { useRiderProfileStore } from '@/pages-rider/account/profile'

const RIDER_ORDER_LIST_URL = RiderRoutes.Delivery.tasks
const RIDER_WORKBENCH_URL = RiderRoutes.Workspace.workspace

/**
 * 装配个人中心概览、资料、今日任务统计与导航入口。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const page = useRiderAccountPage() // 在页面 setup 中绑定菜单与概览
 */
export function useRiderAccountPage() {
  useRiderTaskRefresh()
  // 经 storeToRefs 解构，保持与页面之间的响应式链路
  const overview = useRiderAccountOverview()
  const account = useRiderProfileStore()
  const { ensureLogin, logout, profile: basicProfile } = useRiderLoginAuth()
  const profile = computed(() => account.profile || basicProfile.value)
  const { stats, online, serviceArea } = storeToRefs(useRiderTaskStore())

  const { resolveStationPhone } = useRiderAccountContact()
  const settingMenus = computed<RiderSettingItem[]>(() => [
    { name: t('rider.task.history'), description: t('rider.profile.historyHint'), icon: 'i-carbon-document', color: '#2196F3', action: () => go(RIDER_ORDER_LIST_URL) },
    { name: t('rider.profile.title'), description: t('rider.profile.editHint'), icon: 'i-carbon-user', color: '#A0826D', action: () => go(RiderRoutes.Account.profile) },
    { name: t('rider.settings.rules'), description: t('rider.profile.rulesHint'), icon: 'i-carbon-settings-adjust', color: '#FF9800', action: () => go(RiderRoutes.Account.settings) },
    { name: t('rider.settings.sound'), description: t('rider.profile.soundHint'), icon: 'i-carbon-notification', color: '#9C27B0', action: () => go(`${RiderRoutes.Account.settings}?section=reminders`) },
    { name: t('rider.profile.contact'), description: t('rider.profile.contactHint'), icon: 'i-carbon-headset', color: '#009688', contact: true },
  ])

  function goWorkbench() {
    go(RIDER_WORKBENCH_URL)
  }

  onShow(() => {
    if (ensureLogin()) {
      void account.refresh()
      void overview.refresh()
    }
  })

  return {
    profile,
    stats,
    income: computed(() => riderIncomeAmounts(stats.value, serviceArea.value?.currency)),
    level: computed(() => overview.overview.value?.level || t('rider.profile.rider')),
    rating: computed(() => overview.overview.value?.rating ?? '—'),
    completedCount: computed(() => overview.overview.value?.completedCount ?? '—'),
    overviewError: overview.error,
    refreshOverview: overview.refresh,
    online,
    settingMenus,
    resolveStationPhone,
    goWorkbench,
    logout,
  }
}
