import { shopText as st } from '@/locale/shop-text'
import { isDemo } from '@/pages-shop/auth/login'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import type { ShopDashboard } from '../models/index'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

const dashboardDemoEnabled = import.meta.env.DEV && isDemo

export const dashboardApi = {
  demoEnabled: dashboardDemoEnabled,
  async createDemoOrder(ctx: ShopRequestContext) {
    if (!dashboardDemoEnabled)
      return
    // eslint-disable-next-line project-mock/boundaries -- 商家分包的开发演示接缝。
    return (await import('../mock')).handle(endpoints.demoOrder, { shopId: ctx.shopId }, ctx.token)
  },
  overview: (ctx: ShopRequestContext) =>
    (async () => {
      const data = { shopId: ctx.shopId }
      if (dashboardDemoEnabled) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.dashboard, data, ctx.token) as ShopDashboard & { pendingCount: number }
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Get<ShopDashboard & { pendingCount: number }>(endpoints.dashboard, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
    })(),
}
