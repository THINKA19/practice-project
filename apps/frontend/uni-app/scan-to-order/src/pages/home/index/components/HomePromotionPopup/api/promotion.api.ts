import { bannerRequests } from '../../../api/banner.api'
import { parseBanners } from '../../../models/mappers'

/** 获取首页竖屏广告，沿用现有广告列表契约。 */
export async function fetchHomePromotion() {
  const [promotion] = parseBanners(await bannerRequests.banners('shouye_popup'))
  return promotion
}
