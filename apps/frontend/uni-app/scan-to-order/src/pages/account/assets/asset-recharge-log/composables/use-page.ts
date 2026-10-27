import { useAssetList } from '../../asset'
import { rechargeLogApi } from './use-requests'

/** 加载充值流水的独立分页实例，只读取已确认支付状态的记录。 */
export function useRechargeLogPage() {
  return useAssetList((page, pageSize) => rechargeLogApi.payLogs({ page, pageSize, status: 1 }))
}
