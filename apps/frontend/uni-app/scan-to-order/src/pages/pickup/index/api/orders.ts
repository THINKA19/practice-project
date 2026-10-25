import type { OrderDoingData } from '../models/order'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'
/** 查询制作中与配送中订单，不缓存服务端进度。 */
export const pickupApi = {
  list: () => http.Get<OrderDoingData>(endpoints.list, { params: { type: 0, statusBatch: '1,2' }, cacheFor: 0 }),
}
