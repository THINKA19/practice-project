import type { OrderDetailDataDto as OrderDetailData, PickupDemoSceneDto as PickupDemoScene, ShopSubItemDto as ShopSubItem } from './orders.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const orderDetailApi = {
  preview: (scene: PickupDemoScene) => http.Get<OrderDetailData>(endpoints.preview, { params: { scene }, cacheFor: 0 }),
  demoPay: () => http.Post<OrderDetailData>(endpoints.demoPay, {}),
  detail: (id: string | number) => http.Get<OrderDetailData>(endpoints.detail, { params: { id }, cacheFor: 0 }),
  shop: (id: string | number) => http.Get<ShopSubItem>(endpoints.shop, { params: { id } }),
}
