import type { PickupSceneDto as PickupScene } from './orders.dto'
import type { OrderDoingData } from '@/pages/pickup/shared'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const doingApi = { preview: (scene: PickupScene = 'multiple') => http.Get<OrderDoingData>(endpoints.preview, { params: { scene }, cacheFor: 0 }) }
