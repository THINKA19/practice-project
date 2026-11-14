/**
 * ============================================================================
 * 门店订单详情接口
 * ============================================================================
 *
 * 【文件概述】
 * 读取指定订单，提交履约动作及打印请求。
 *
 * 【方法与导出清单】
 * - fetchShopOrder、submitShopOrderAction、printShopOrder：详情请求。
 *
 * 【综合使用示例】
 * ```typescript
 * import { fetchShopOrder } from './api/orders'
 * // 已授权页面调用 await fetchShopOrder(context, id)
 * ```
 * ============================================================================
 */
import { shopText as st } from '@/locale/shop-text'
// eslint-disable-next-line project-mock/boundaries -- 仅判断开发环境，业务 Mock 数据由接口适配接缝加载。
import { USE_MOCK } from '@/mock/config'
import { validateShopOrder } from '../../list'
import type { ShopOrder } from '../../list'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

/**
 * 读取并校验单张订单。
 * @param context 门店请求快照。
 * @param id 订单编号。
 * @returns 本店指定订单。
 * @example await fetchShopOrder(context, id) // => 指定订单
 */
export async function fetchShopOrder(context: ShopRequestContext, id: string) {
  const order = validateShopOrder(await (async () => {
    const data = { shopId: context.shopId, id }
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.detail, data, context.token) as ShopOrder
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))
    return http.Get<ShopOrder>(endpoints.detail, { headers: { Authorization: `Bearer ${context.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
  })())
  if (order.id !== id || order.shopId !== context.shopId)
    throw new Error(st('订单数据无效'))
  return order
}
/**
 * 向服务端提交带版本的履约动作。
 * @param context 门店请求快照。
 * @param order 订单及当前版本。
 * @param action 履约动作。
 * @returns 服务端动作结果。
 * @example await submitShopOrderAction(context, order, 'accept') // => 受理结果
 */
export async function submitShopOrderAction(context: ShopRequestContext, order: ShopOrder, action: string, verificationCode?: string) {
  return (async () => {
    const data = { shopId: context.shopId, id: order.id, version: order.version, action, ...(verificationCode ? { verificationCode } : {}) }
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.action, data, context.token) as unknown
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))
    return http.Post<unknown>(endpoints.action, data, { headers: { Authorization: `Bearer ${context.token}` }, cacheFor: 0, meta: { toast: false } }).send()
  })()
}

/** 提交订单打印任务。@param context 门店快照 @param id 订单编号 @returns 打印任务受理结果 @example await printShopOrder(context, id) // 任务确认 */
export async function printShopOrder(context: ShopRequestContext, id: string) {
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 开发模拟打印受理，生产移除。
    return (await import('../mock')).handle(endpoints.print, { shopId: context.shopId, id }, context.token)
  }
  if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
    throw new Error('商家业务服务尚未配置')
  return http.Post(endpoints.print, { shopId: context.shopId, id }, { headers: { Authorization: `Bearer ${context.token}` }, cacheFor: 0, meta: { toast: false } }).send()
}
