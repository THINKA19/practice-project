import { http } from '@/http/alova'
import { endpoints, isAssetDemo } from './endpoints'

export const scoreRequests = {
  scoreLogs(params: { page: number, pageSize: number }, headers: Record<string, string>) {
    return http.Post<unknown>(isAssetDemo() ? endpoints.demoLogs : endpoints.scoreLogs, params, {
      headers,
      cacheFor: 0,
      meta: { ignoreAuth: true },
    }).send()
  },
}
