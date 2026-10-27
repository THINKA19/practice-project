import { cashLogRequests } from '../api/cash-log.api'
import { assetHeaders, parseAssetPage } from '../../asset'
import type { CashLog } from '../models/types'

/** 余额流水业务门面：请求由 api 执行，此处校验分页及金额字段并返回业务列表。 */
export const cashLogApi = {
  async cashLogs(params: { page: number, pageSize: number }) {
    const data = await cashLogRequests.cashLogs(params, assetHeaders())
    return parseAssetPage<CashLog>(data, 'amount')
  },
}
