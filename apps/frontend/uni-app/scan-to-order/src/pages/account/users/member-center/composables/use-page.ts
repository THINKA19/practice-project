/** 会员中心：沿用旧页面布局，使用正式客户会话与资产模块。 */
import type { UserLevel } from '../models/types'
import { onScopeDispose, ref } from 'vue'
import { useMemberCenterAccount } from './use-account'
import { levelApi } from './use-requests'

/** 页面 onShow 刷新；错误和未开放状态分别展示。 */
export function useMemberCenterPage() {
  const account = useMemberCenterAccount()
  const levelList = ref<UserLevel[]>([])
  const levelFailed = ref(false)
  const levelLoading = ref(levelApi.available)
  let disposed = false
  let pending: Promise<void> | null = null
  onScopeDispose(() => {
    disposed = true
  })

  function refreshLevels() {
    if (disposed)
      return Promise.resolve()
    if (pending)
      return pending
    levelLoading.value = levelApi.available
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
  function refresh() {
    if (disposed)
      return Promise.resolve()
    return Promise.all([account.refresh(), refreshLevels()]).then(() => {})
  }
  return { ...account, levelList, levelFailed, levelLoading, levelsAvailable: levelApi.available, refresh }
}
