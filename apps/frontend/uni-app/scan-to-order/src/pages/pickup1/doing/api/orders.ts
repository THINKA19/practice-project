import type { PickupScene } from '../models/scene'
import type { OrderDoingData } from '@/pages/pickup/index'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const doingApi = { preview: (scene: PickupScene = 'multiple') => http.Get<OrderDoingData>(endpoints.preview, { params: { scene }, cacheFor: 0 }) }
