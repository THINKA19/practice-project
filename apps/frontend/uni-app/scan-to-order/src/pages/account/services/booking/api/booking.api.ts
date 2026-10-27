import { endpoints } from './endpoints'
import { API_DOMAINS, http } from '@/http/alova'

export const bookingRequests = {
  join(data: { yuyueId: string, extJsonStr: string }) {
    return http.Post<unknown>(endpoints.join, data, { cacheFor: 0, meta: { domain: API_DOMAINS.SECONDARY } }).send()
  },
  info: () => http.Get<{ id: string }>(endpoints.info, { params: { key: 'table-booking' }, cacheFor: 0, meta: { domain: API_DOMAINS.SECONDARY } }),
}
