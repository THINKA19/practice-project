import type { ScanOrderDetail } from '../models/order'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const scanApi = {
  detail: (hxNumber: string) => http.Get<ScanOrderDetail>(endpoints.detail, { params: { hxNumber }, cacheFor: 0 }),
  verify: (hxNumber: string) => http.Post(endpoints.verify, { hxNumber }),
  demoDetail: (hxNumber: string) => http.Get<ScanOrderDetail>(endpoints.demoDetail, { params: { hxNumber }, cacheFor: 0 }),
  demoVerify: (hxNumber: string) => http.Post(endpoints.demoVerify, { hxNumber }),
}
