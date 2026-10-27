import { billRequests } from '../api/bill.api'
/** 买单演示请求；正式环境未确认支付契约时禁止本地伪造支付。 */
import type { PayBillDiscount } from '../models/types'

/** 仅判断开发买单演示是否开启，不表示真实支付服务可用。 */
export const isBillDemo = () => import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
/** 买单业务门面：校验优惠规则及模拟支付结果，正式支付未开放时不伪造成功。 */
export const billApi = {
  async rules(): Promise<PayBillDiscount[]> {
    if (!isBillDemo())
      return []
    const rules = await billRequests.rules()
    if (!Array.isArray(rules) || rules.some(rule => !rule || (typeof rule.id !== 'string' && typeof rule.id !== 'number')
      || !Number.isFinite(rule.consume) || rule.consume < 0 || !Number.isFinite(rule.discounts) || rule.discounts < 0)) {
      throw new Error('优惠规则加载失败')
    }
    return rules
  },
  async pay(amountCents: number, requestId: string) {
    if (!isBillDemo())
      throw new Error('门店买单支付尚未开放')
    const result = await billRequests.pay(amountCents, requestId)
    if (!result || result.demo !== true || !Number.isSafeInteger(result.payableCents) || result.payableCents < 0 || result.payableCents > amountCents)
      throw new Error('未收到有效的模拟买单结果')
    return result
  },
}
