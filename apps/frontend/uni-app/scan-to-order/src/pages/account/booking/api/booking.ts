import { endpoints } from './endpoints'
import { API_DOMAINS, http } from '@/http/alova'

export const bookingApi = {
  info: () => http.Get<{ id: string }>(endpoints.info, { params: { key: 'table-booking' }, cacheFor: 0, meta: { domain: API_DOMAINS.SECONDARY } }),
  join: (data: { yuyueId: string, extJsonStr: string }) => http.Post(endpoints.join, data, { meta: { domain: API_DOMAINS.SECONDARY } }),
}
