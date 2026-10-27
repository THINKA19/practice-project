import { endpoints } from './endpoints'
import { API_DOMAINS, http } from '@/http/alova'

export const cmsRequests = {
  cmsPage(key: string) {
    return http.Get<unknown>(endpoints.cmsPage, { params: { key }, cacheFor: 0, meta: { ignoreAuth: true, toast: false, domain: API_DOMAINS.SECONDARY } }).send()
  },
}
