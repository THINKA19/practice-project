import { shopText as st } from '@/locale/shop-text'
// eslint-disable-next-line project-mock/boundaries -- 仅在业务 API 选择开发环境数据源。
import { USE_MOCK } from '@/mock/config'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import type { StatisticsReport } from '../models/index'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

const isStatisticsDemo = import.meta.env.DEV && USE_MOCK

export const statisticsApi = {
  async overview(ctx: ShopRequestContext, period: number) {
    const data = { shopId: ctx.shopId, period }
    if (isStatisticsDemo) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.overview, data, ctx.token)
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))
    return http.Get<StatisticsReport>(endpoints.overview, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
  },
}
