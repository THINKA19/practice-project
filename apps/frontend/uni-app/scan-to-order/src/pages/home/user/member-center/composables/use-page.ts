import type { UserLevel } from '../models/types'
import { onScopeDispose, ref } from 'vue'
import { useMemberCenterAccount } from './use-account'
import { levelApi } from './use-requests'
import { requireIdentity } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
import { toast } from '@/utils/project/feedback'
import { t } from '@/locale'

const servicePaths = {
  wallet: ClientRoutes.Account.asset,
  score: ClientRoutes.Account.scoreLogs,
  code: ClientRoutes.Account.userCode,
  coupons: ClientRoutes.Home.coupons,
}

/** 页面 onShow 刷新；错误和未开放状态分别展示。 */
export function useMemberCenterPage() {
  const account = useMemberCenterAccount()
  const levelList = ref<UserLevel[]>([])
  const levelFailed = ref(false)
  const levelsAvailable = levelApi.available
  const levelLoading = ref(levelsAvailable)
  let disposed = false
  let pending: Promise<void> | null = null
  onScopeDispose(() => {
    disposed = true
  })

  function refreshLevels() {
    if (disposed || !levelsAvailable)
      return Promise.resolve()
    if (pending)
      return pending
    levelLoading.value = true
    levelFailed.value = false
    pending = levelApi.levels().then((rows) => {
      if (!disposed)
        levelList.value = rows
    }).catch(() => {
      if (!disposed) {
        // 刷新失败保留已显示的等级，避免卡片消失。
        levelFailed.value = true
      }
    }).finally(() => {
      pending = null
      if (!disposed)
        levelLoading.value = false
    })
    return pending
  }
  async function refresh() {
    if (disposed)
      return
    await Promise.all([account.refresh(), refreshLevels()])
  }

  /** 私人资产及会员凭证入口统一校验顾客身份。 */
  async function openService(service: keyof typeof servicePaths) {
    if (disposed || !requireIdentity('customer'))
      return
    const result = await navigate(servicePaths[service])
    if (!disposed && !result.ok)
      toast(t('common.navigationFailed'))
    return result
  }
  return { ...account, levelList, levelFailed, levelLoading, levelsAvailable, refresh, openService }
}
