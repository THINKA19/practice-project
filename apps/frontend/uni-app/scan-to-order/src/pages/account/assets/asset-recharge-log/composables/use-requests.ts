import { rechargeLogRequests } from '../api/recharge-log.api'
import { assetHeaders, parseAssetPage } from '../../asset'
import type { PayLog } from '../models/types'

/** 充值流水业务门面：将原始分页转换为业务记录，失败向页面传播。 */
export const rechargeLogApi = {
  async payLogs(params: { page: number, pageSize: number, status: number }) {
    const data = await rechargeLogRequests.payLogs(params, assetHeaders())
    return parseAssetPage<PayLog>(data, 'money')
  },
}
