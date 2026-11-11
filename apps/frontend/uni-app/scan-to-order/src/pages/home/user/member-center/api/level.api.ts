import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const levelRequests = {
  levels() {
    return http.Get<unknown>(endpoints.demoLevels, { cacheFor: 0, meta: { ignoreAuth: true } }).send()
  },
}
