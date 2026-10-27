import type { AssetPage } from '../models/types'
import { usePagedList } from '@/hooks/project/usePagedList'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { isAssetDemo } from './use-context'

/** 钱包流水的顾客准入与账号隔离；分页机制由通用 Hook 执行。 */
export function useAssetList<T extends { id: number }>(fetchPage: (page: number, pageSize: number) => Promise<AssetPage<T>>) {
  const session = useSessionState()
  return usePagedList(fetchPage, { scopeKey: () => session.sessionRevision, beforeLoad: () => {
    session.updateNowTime()
    return (isAssetDemo() && !session.identity) || requireIdentity('customer')
  } })
}
