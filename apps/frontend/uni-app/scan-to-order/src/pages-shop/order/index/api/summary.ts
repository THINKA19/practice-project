// eslint-disable-next-line project-mock/boundaries -- Existing development adapter switch.
import { USE_MOCK } from '@/mock/config'
import { http } from '@/http/alova'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import { shopText as st } from '@/locale/shop-text'
import { parseOrderCenterSummary } from '../models/summary'

const endpoint = '/operator/shop/orders/summary'

/** Reads pending counts and status codes for the authorized shop. */
export async function fetchOrderCenterSummary({ token, shopId }: ShopRequestContext) {
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- Development-only order center adapter.
    const { summary } = await import('../mock')
    return parseOrderCenterSummary(summary(token, shopId), shopId)
  }
  if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
    throw new Error(st('商家业务服务尚未配置'))

  const result = await http.Get<unknown>(endpoint, {
    params: { shopId },
    headers: { Authorization: `Bearer ${token}` },
    cacheFor: 0,
    meta: { toast: false },
  }).send()
  return parseOrderCenterSummary(result, shopId)
}
