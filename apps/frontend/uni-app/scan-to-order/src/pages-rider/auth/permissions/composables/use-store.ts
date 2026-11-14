/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderPermissionsStore：保存当前账号的服务端资格与权限；动作前重新获取并校验归属。
 * 【综合使用示例】
 * import { useRiderPermissionsStore } from '@/pages-rider/auth/permissions/composables/use-store'
 * const permissions = useRiderPermissionsStore(); await permissions.requirePermission('task.grab') // 未授权时拒绝
 * ============================================================================
 */
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { fetchRiderGrant } from '../api/permissions.api'
import { toRiderGrant } from '../models/mappers'
import type { RiderGrant } from '../models/types'
import { canRiderOperate } from '../domain/permissions.rules'
/**
 * 保存当前账号的服务端资格与权限；动作前重新获取并校验归属。
 * 无参数；须在已安装 Pinia 的应用中调用。
 * @returns 当前 Pinia 实例中本领域的状态与操作。
 * @example const permissions = useRiderPermissionsStore(); await permissions.requirePermission('task.grab') // 未授权时拒绝
 */
export const useRiderPermissionsStore = defineStore('rider-permissions', () => {
  const session = useSessionState()
  const grant = ref<RiderGrant | null>(null)
  const error = ref('')
  const loading = ref(false)
  let revision = 0
  const currentIdentity = computed(() => session.hasLogin && session.identity === 'rider' ? session.sessionRevision : -1)
  watch(currentIdentity, () => {
    revision++
    grant.value = null
    error.value = ''
    loading.value = false
  }, { flush: 'sync' })
  /**
   * 刷新权限并验证账号归属，最新请求覆盖旧请求。
   * 无参数。
   * @returns Promise<boolean>，只有本次授权有效且仍属于当前账号时返回 true。
   * @example await store.refresh() // 有效授权时 true
   */
  async function refresh(): Promise<boolean> {
    session.updateNowTime()
    const identity = currentIdentity.value
    const started = ++revision
    if (!session.hasLogin || session.identity !== 'rider')
      return false
    loading.value = true
    grant.value = null
    error.value = ''
    try {
      const result = toRiderGrant(await fetchRiderGrant())
      if (identity !== currentIdentity.value || started !== revision)
        return false
      if (result.riderId !== String(session.userInfo.userId))
        throw new Error('权限归属与当前骑手不一致')
      grant.value = result
      return true
    }
    catch (reason) {
      if (identity === currentIdentity.value && started === revision)
        error.value = reason instanceof Error ? reason.message : '权限加载失败'
      return false
    }
    finally {
      if (started === revision)
        loading.value = false
    }
  }
  /**
   * 动作前重新验证资格与具体权限。
   * @param permission 待执行动作的权限项，例如 task.pickup。
   * @returns Promise<void>；无资格、缺权、跨账号或请求失败时拒绝。
   * @example await store.requirePermission('task.pickup') // 无权限时抛错
   */
  async function requirePermission(permission: string) {
    if (!await refresh() || !canRiderOperate(session.identity, grant.value, permission))
      throw new Error(error.value || '当前骑手没有此操作权限')
  }
  return { grant, error, loading, refresh, requirePermission }
})
