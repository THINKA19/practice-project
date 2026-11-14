import { shopText as st } from '@/locale/shop-text'
import { USE_MOCK } from '@/mock/config'
import { http } from '@/http/alova'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import { endpoints } from './endpoints'

export interface MerchantEvent { id: string, sequence: number, shopId: string, kind: 'new-order' | 'ready', orderId: string, tableNo: string }
export async function fetchMerchantEvents(context: ShopRequestContext, after?: number) {
  const result = await (async () => {
    const data = {
    shopId: context.shopId,
    ...(after === undefined ? {} : { after }),
  }
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.events, data, context.token) as { cursor: number, events: MerchantEvent[] }
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))
    return http.Get<{ cursor: number, events: MerchantEvent[] }>(endpoints.events, { headers: { Authorization: `Bearer ${context.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
  })()
  if (!Number.isSafeInteger(result?.cursor) || result.cursor < 0 || !Array.isArray(result.events) || !result.events.every(e => typeof e.id === 'string' && !!e.id && Number.isSafeInteger(e.sequence) && e.sequence > 0 && e.shopId === context.shopId && typeof e.tableNo === 'string' && typeof e.orderId === 'string' && ['new-order', 'ready'].includes(e.kind)))
    throw new Error(st('提醒数据无效'))
  return result
}
