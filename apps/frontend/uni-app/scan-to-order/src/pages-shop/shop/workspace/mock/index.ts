import { merchantClock } from '@/pages-shop/auth/permissions/models/market'
import { authorize } from '@/pages-shop/auth/permissions/mock'
import { orders, createOrder } from '@/pages-shop/order/list/mock'
import { endpoints } from '../api/endpoints'
import { savedShopOverview } from '@/pages-shop/shop/index/mock'
/** 从订单事实计算工作台。@param endpoint 路径 @param data 门店 @param token 凭证 @returns 概览或新单 @example handle(endpoints.dashboard, {shopId:'A'}, token) // 概览 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string): unknown {
  const id = String(data.shopId); const shop = authorize(token, id, 'order.read')
  if (endpoint === endpoints.demoOrder) return createOrder(token, id)
  if (endpoint !== endpoints.dashboard) throw new Error('未知工作台请求')
  const list = orders(token, id)
  const saved = savedShopOverview(id)
  const open = saved?.open ?? true
  const clock = merchantClock(shop)
  const today = clock(new Date()).day
  const todaysOrders = list.filter(order => clock(new Date(order.createdAt)).day === today)
  const revenue = shop.permissions.includes('statistics.read')
    ? todaysOrders.filter(order => order.status !== 5).reduce((sum, order) => sum + (order.amount || 0), 0).toFixed(2)
    : undefined
  return {
    shopName: saved?.name ?? shop.name,
    statusText: open ? '营业中' : '休息中',
    open,
    today: { orders: shop.roleTemplate === 'owner' ? todaysOrders.length : 0, ...(revenue === undefined ? {} : { revenue }) },
    pendingCount: list.filter(order => order.status === 1).length,
  }
}
