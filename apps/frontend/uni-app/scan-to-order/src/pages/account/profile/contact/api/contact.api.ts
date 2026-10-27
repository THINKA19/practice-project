import { endpoints } from './endpoints'
import { http } from '@/http/alova'

export const contactRequests = {
  config() {
    return http.Get<unknown>(endpoints.config, { cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
