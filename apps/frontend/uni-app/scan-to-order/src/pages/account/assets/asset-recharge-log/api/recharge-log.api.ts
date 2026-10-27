import { http } from '@/http/alova'
import { isAssetDemo } from '../../asset'
import { endpoints } from './endpoints'

export const rechargeLogRequests = {
  payLogs(params: { page: number, pageSize: number, status: number }, headers: Record<string, string>) {
    return http.Post<unknown>(isAssetDemo() ? endpoints.demoLogs : endpoints.logs, params, {
      headers,
      cacheFor: 0,
      meta: { ignoreAuth: true },
    }).send()
  },
}
