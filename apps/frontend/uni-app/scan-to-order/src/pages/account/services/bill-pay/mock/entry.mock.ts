/** 开发买单演示，不写入钱包，不调用真实支付。 */
import { defineMock } from '@alova/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { endpoints } from '../api/endpoints'
import { matchDiscount, quoteBill } from '../domain/bill-pay.rules'

const rules = [
  { id: 'd1', consume: 50, discounts: 5 },
  { id: 'd2', consume: 100, discounts: 10 },
  { id: 'd3', consume: 200, discounts: 20 },
]
const requests = new Map<string, { amountCents: number, payableCents: number, demo: true }>()
export function reset() {
  requests.clear()
}
export default defineMock({
  [`[GET]${endpoints.rules}`]: withFailure(() => ok(rules)),
  [`[POST]${endpoints.pay}`]: withFailure(({ headers, data }) => {
    if (!/^Bearer wx-demo-session-\S+$/.test(String(headers.Authorization ?? '')))
      return fail('请先登录顾客账户')
    const owner = mockCustomerOwner(headers.Authorization)
    const body = data as { amountCents?: unknown, requestId?: unknown }
    if (!body || typeof body.amountCents !== 'number' || !Number.isSafeInteger(body.amountCents) || body.amountCents <= 0 || body.amountCents > 999999999 || typeof body.requestId !== 'string' || !body.requestId)
      return fail('买单参数无效')
    const key = `${owner}:${body.requestId}`
    const old = requests.get(key)
    if (old) {
      if (old.amountCents !== body.amountCents)
        return fail('重复请求金额不一致')
      return ok(old)
    }
    const result = { ...quoteBill(body.amountCents, matchDiscount(rules, body.amountCents / 100)), demo: true as const }
    requests.set(key, result)
    return ok(result)
  }, { write: true }),
})
