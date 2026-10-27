import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const memberCodeRequests = {
  dynamic(token: string) {
    return http.Get<unknown>(endpoints.demoCode, {
      headers: { Authorization: `Bearer ${token}` },
      cacheFor: 0,
      meta: { ignoreAuth: true, toast: false },
    }).send()
  },
}
