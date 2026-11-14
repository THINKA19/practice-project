import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import type { TableItem } from '../models'
import { http } from '@/http/alova'
import { shopText as st } from '@/locale/shop-text'
// eslint-disable-next-line project-mock/boundaries -- 仅判断开发环境，业务 Mock 由接口适配接缝加载。
import { USE_MOCK } from '@/mock/config'
import { endpoints } from './endpoints'

export const tableApi = {
  async list(ctx: ShopRequestContext): Promise<TableItem[]> {
    const params = { shopId: ctx.shopId }
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.list, params, ctx.token)
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))

    return http.Get<TableItem[]>(endpoints.list, {
      headers: { Authorization: `Bearer ${ctx.token}` },
      cacheFor: 0,
      meta: { toast: false },
      params,
    }).send()
  },
}
