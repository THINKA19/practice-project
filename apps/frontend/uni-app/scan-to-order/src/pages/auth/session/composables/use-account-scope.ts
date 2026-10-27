import { onScopeDispose, watch } from 'vue'
import { getSessionRevision } from './use-actions'
import { useSessionState } from './use-state'
/** 局部异步操作绑定当前会话，切换账户或离开页面后不再写入 UI。 */
export function useSessionAccountScope(reset: () => void) {
  const session = useSessionState()

  let disposed = false

  watch(() => session.sessionRevision, reset, { flush: 'sync' })

  onScopeDispose(() => {
    disposed = true

    reset()
  })

  return { ticket: () => getSessionRevision(), current: (ticket: number) => !disposed && ticket === getSessionRevision() }
}
