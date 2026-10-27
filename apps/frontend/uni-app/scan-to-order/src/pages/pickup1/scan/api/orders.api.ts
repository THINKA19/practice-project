import type { ScanOrderDetailDto as ScanOrderDetail } from './orders.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'
import { getToken } from '@/pages/auth/session'

function headers() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const scanApi = {
  detail: (hxNumber: string) => http.Get<ScanOrderDetail>(endpoints.detail, { params: { hxNumber }, headers: headers(), cacheFor: 0 }),
  verify: (hxNumber: string) => http.Post(endpoints.verify, { hxNumber }, { headers: headers(), cacheFor: 0 }),
  demoDetail: (hxNumber: string) => http.Get<ScanOrderDetail>(endpoints.demoDetail, { params: { hxNumber }, cacheFor: 0 }),
  demoVerify: (hxNumber: string) => http.Post(endpoints.demoVerify, { hxNumber }),
}
