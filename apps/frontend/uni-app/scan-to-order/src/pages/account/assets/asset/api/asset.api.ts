import { http } from '@/http/alova'
import { endpoints, isAssetDemo } from './endpoints'

export const assetRequests = {
  amount(headers: Record<string, string>) {
    return http.Get<unknown>(isAssetDemo() ? endpoints.demoAmount : endpoints.amount, {
      headers,
      cacheFor: 0,
      meta: { ignoreAuth: true },
    }).send()
  },
  rechargeRules() {
    return http.Get<unknown>(isAssetDemo() ? endpoints.demoRules : endpoints.rechargeRules, { cacheFor: 0 }).send()
  },
  recharge(amount: number, requestId: string, headers: Record<string, string>) {
    return http.Post<unknown>(endpoints.demoRecharge, { amount, requestId }, {
      headers,
      cacheFor: 0,
      meta: { ignoreAuth: true },
    }).send()
  },
}
