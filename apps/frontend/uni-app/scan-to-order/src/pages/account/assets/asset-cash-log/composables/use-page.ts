import { useAssetList } from '../../asset'
import { cashLogApi } from './use-requests'

/** 为余额流水提供独立的分页状态；账号隔离和迟到响应处理委托资产列表组合函数。 */
export function useCashLogPage() {
  return useAssetList((page, pageSize) => cashLogApi.cashLogs({ page, pageSize }))
}
