/**
 * ============================================================================
 * 门店订单列表接口
 * ============================================================================
 *
 * 【文件概述】
 * 查询已授权门店的订单列表。
 *
 * 【方法与导出清单】
 * - fetchShopOrders：读取并校验列表响应。
 *
 * 【综合使用示例】
 * ```typescript
 * import { fetchShopOrders } from './api/orders'
 * // 已授权页面调用 await fetchShopOrders(context)
 * ```
 * ============================================================================
 */
import { shopText as st } from '@/locale/shop-text'
// eslint-disable-next-line project-mock/boundaries -- 仅判断开发环境，业务 Mock 数据由接口适配接缝加载。
import { USE_MOCK } from '@/mock/config'
import type { ShopOrder } from '../models/index'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

import { validateShopOrder } from '../models/validation'

/**
 * 读取授权门店的订单列表。
 * @param context 门店请求快照。
 * @returns 已校验订单数组。
 * @example await fetchShopOrders(context) // => 本店订单
 */
export async function fetchShopOrders(context: ShopRequestContext) {
  const result = await (async () => {
    const data = { shopId: context.shopId }
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.list, data, context.token) as ShopOrder[]
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))
    return http.Get<ShopOrder[]>(endpoints.list, { headers: { Authorization: `Bearer ${context.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
  })()
  if (!Array.isArray(result))
    throw new Error(st('订单列表无效'))
  return result.map(validateShopOrder)
}
