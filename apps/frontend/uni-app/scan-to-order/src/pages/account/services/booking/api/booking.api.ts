import { endpoints } from './endpoints'
import { API_DOMAINS, http } from '@/http/alova'

export const bookingRequests = {
  join(data: { shopId: number, yuyueId: string, requestId: string, extJsonStr: string }) {
    return http.Post<unknown>(endpoints.join, data, { cacheFor: 0, meta: { domain: API_DOMAINS.SECONDARY } }).send()
  },
  info: (shopId: number) => http.Get<{ id: string, shopName: string, slots: string[] }>(endpoints.info, { params: { key: 'table-booking', shopId }, cacheFor: 0, meta: { domain: API_DOMAINS.SECONDARY } }),
}
