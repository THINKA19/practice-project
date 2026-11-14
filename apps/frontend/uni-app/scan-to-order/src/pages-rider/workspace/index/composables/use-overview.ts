/**
 * ============================================================================
 * 【文件概述】骑手工作台的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderWorkspaceOverview：读取工作台公告和可选参考目标；账号变化时废弃旧响应。
 * 【综合使用示例】
 * import { useRiderWorkspaceOverview } from '@/pages-rider/workspace/index/composables/use-overview'
 * const overview = useRiderWorkspaceOverview(); await overview.refresh() // 工作台配置
 * ============================================================================
 */
import { ref } from 'vue'
import { useSessionAccountScope, useSessionState } from '@/pages/auth/session'
import { fetchRiderWorkspace } from '../api/workspace.api'
import { toRiderWorkspace } from '../models/mappers'
import type { RiderWorkspaceOverview } from '../models/types'
/**
 * 读取工作台公告和可选参考目标；账号变化时废弃旧响应。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const overview = useRiderWorkspaceOverview(); await overview.refresh() // 工作台配置
 */
export function useRiderWorkspaceOverview() {
  const session = useSessionState()
  const overview = ref<RiderWorkspaceOverview | null>(null)
  const loading = ref(false)
  const error = ref('')
  let revision = 0
  const scope = useSessionAccountScope(() => {
    revision++
    overview.value = null
    loading.value = false
    error.value = ''
  })
  async function refresh() {
    session.updateNowTime()
    if (!session.hasLogin || session.identity !== 'rider')
      return
    const ticket = scope.ticket()
    const started = ++revision
    loading.value = true
    error.value = ''
    try {
      const result = toRiderWorkspace(await fetchRiderWorkspace())
      if (scope.current(ticket) && started === revision)
        overview.value = result
    }
    catch (reason) {
      if (scope.current(ticket) && started === revision)
        error.value = reason instanceof Error ? reason.message : '概览读取失败'
    }
    finally {
      if (scope.current(ticket) && started === revision)
        loading.value = false
    }
  }
  return { overview, loading, error, refresh }
}
