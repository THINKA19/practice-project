/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderSettingsRules：加载接单规则并隔离账号切换和页面销毁后的响应。
 * 【综合使用示例】
 * import { useRiderSettingsRules } from '@/pages-rider/account/settings/composables/use-rules'
 * const rules = useRiderSettingsRules(); await rules.refresh() // 读取当前规则
 * ============================================================================
 */
import { ref } from 'vue'
import { useSessionAccountScope, useSessionState } from '@/pages/auth/session'
import { fetchRiderRules } from '../api/rules.api'
import type { RiderRules } from '../models/types'
import { validateRules } from '../models/mappers'

/**
 * 加载接单规则并隔离账号切换和页面销毁后的响应。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const rules = useRiderSettingsRules(); await rules.refresh() // 读取当前规则
 */
export function useRiderSettingsRules() {
  const session = useSessionState()
  const rules = ref<RiderRules | null>(null)
  const error = ref('')
  const loading = ref(false)
  let revision = 0
  const scope = useSessionAccountScope(() => {
    revision++
    rules.value = null
    error.value = ''
    loading.value = false
  })
  async function refresh() {
    session.updateNowTime()
    const ticket = scope.ticket()
    const current = ++revision
    if (!session.hasLogin || session.identity !== 'rider')
      return
    loading.value = true
    error.value = ''
    try {
      const data = validateRules(await fetchRiderRules())
      if (scope.current(ticket) && current === revision)
        rules.value = data
    }
    catch (reason) {
      if (scope.current(ticket) && current === revision)
        error.value = reason instanceof Error ? reason.message : '规则加载失败'
    }
    finally {
      if (scope.current(ticket) && current === revision)
        loading.value = false
    }
  }
  return { rules, error, loading, refresh }
}
