import type { ActivityGalleryGroupDto as ActivityGalleryGroup } from './service.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'
/** 查询服务活动分组，开发环境可由领域 Mock 响应。 */
export const serviceApi = {
  gallery: () => http.Get<ActivityGalleryGroup[]>(endpoints.gallery, { cacheFor: 0, meta: { ignoreAuth: true } }),
}
