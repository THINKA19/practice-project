/**
 * ============================================================================
 * 【文件概述】个人中心的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderAccountOverview：读取账户等级、评分和累计完成量；处理重试、乱序与离页清理。
 * 【综合使用示例】
 * import { useRiderAccountOverview } from '@/pages-rider/account/index/composables/use-overview'
 * const overview = useRiderAccountOverview(); await overview.refresh() // 当前账号概览
 * ============================================================================
 */
import { ref } from 'vue'
import { useSessionAccountScope, useSessionState } from '@/pages/auth/session'
import { fetchRiderAccount } from '../api/account.api'
import { toRiderAccount } from '../models/mappers'
import type { RiderAccountOverview } from '../models/types'
/**
 * 读取账户等级、评分和累计完成量；处理重试、乱序与离页清理。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const overview = useRiderAccountOverview(); await overview.refresh() // 当前账号概览
 */
export function useRiderAccountOverview() {
  const session = useSessionState()
  const overview = ref<RiderAccountOverview | null>(null)
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
      const result = toRiderAccount(await fetchRiderAccount())
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
