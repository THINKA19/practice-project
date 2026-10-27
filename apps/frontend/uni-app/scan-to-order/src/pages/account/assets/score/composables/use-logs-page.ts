import { usePagedList } from '@/hooks/project/usePagedList'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { isAssetDemo } from './use-context'
import { scoreApi } from './use-requests'

/** 加载积分流水的独立分页实例，复用资产列表的账号隔离和错误状态。 */
export function useScoreLogsPage() {
  const session = useSessionState()
  return usePagedList((page, pageSize) => scoreApi.scoreLogs({ page, pageSize }), { scopeKey: () => session.sessionRevision, beforeLoad: () => {
    session.updateNowTime()
    return (isAssetDemo() && !session.identity) || requireIdentity('customer')
  } })
}
