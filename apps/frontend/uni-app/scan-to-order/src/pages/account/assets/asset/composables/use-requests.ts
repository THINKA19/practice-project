import { assetRequests } from '../api/asset.api'
import type { RechargeRule } from '../models/types'
import { assetHeaders, isAssetDemo } from './use-context'
import { parseAssetAmount, parseRechargeRules } from '../models/mappers'

/** 钱包业务门面：校验余额和充值套餐；充值演示必须显式开启且由响应确认。 */
export const assetApi = {
  async amount() {
    const data = await assetRequests.amount(assetHeaders())
    return parseAssetAmount(data)
  },
  async rechargeRules(): Promise<RechargeRule[]> {
    const data = await assetRequests.rechargeRules()
    return parseRechargeRules(data)
  },
  /** 原代码仅本地确认；真实充值接口与支付凭证尚未提供。 */
  async recharge(amount: number, requestId: string) {
    if (!isAssetDemo())
      throw new Error('充值支付暂未开放')
    const data = await assetRequests.recharge(amount, requestId, assetHeaders(true))
    return parseAssetAmount(data)
  },
}
