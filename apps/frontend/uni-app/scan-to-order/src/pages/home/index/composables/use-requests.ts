import { bannerRequests } from '../api/banner.api'
import { parseBanners } from '../models/mappers'

/** 轮播业务门面：只保留具有有效图片字段的记录，请求失败由展示层降级。 */
export const bannerApi = {
  banners: async (type: string) => parseBanners(await bannerRequests.banners(type)),
}
