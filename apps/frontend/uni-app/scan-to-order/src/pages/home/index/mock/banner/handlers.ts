/**
 * ============================================================================
 * 【文件概述】首页轮播 Mock 路由，对应 pages/home/index/api/banner.ts。
 * 【方法与导出清单】默认导出 GET /banner/list 的模拟响应规则。
 * 【综合使用示例】
 * import { bannerApi } from '@/pages/home/index'
 * const banners = await bannerApi.banners('shouye') // 开发 Mock 开启时返回本地图片
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { createHomeBanners } from './data'
import { endpoints } from '../../api/endpoints'
import { ok } from '@/mock/utils/response'
import { withFailure } from '@/mock/utils/scenario'

export default defineMock({
  [`[GET]${endpoints.banners}`]: withFailure(({ query }) => ok(createHomeBanners(String(query.type || '')))),
})
