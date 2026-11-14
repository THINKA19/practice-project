import { shopText as st } from '@/locale/shop-text'
// eslint-disable-next-line project-mock/boundaries -- 仅判断开发环境，业务数据通过接口适配接缝加载。
import { USE_MOCK } from '@/mock/config'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import type { DeliveryTask, MerchantDeliverySnapshot } from '../models/index'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const deliveryApi = {
  list: (ctx: ShopRequestContext) =>
    (async () => {
      const data = { shopId: ctx.shopId }
      if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.list, data, ctx.token) as MerchantDeliverySnapshot
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Get<MerchantDeliverySnapshot>(endpoints.list, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
    })(),
  dispatch: (ctx: ShopRequestContext, task: Pick<DeliveryTask, 'id' | 'version'>, riderId: string) =>
    (async () => {
      const data = { shopId: ctx.shopId, id: task.id, version: task.version, riderId }
      if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.dispatch, data, ctx.token) as unknown
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Post<unknown>(endpoints.dispatch, data, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false } }).send()
    })(),
  withdraw: (ctx: ShopRequestContext, task: Pick<DeliveryTask, 'id' | 'version'>) =>
    (async () => {
      const data = { shopId: ctx.shopId, id: task.id, version: task.version }
      if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.withdraw, data, ctx.token) as unknown
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Post<unknown>(endpoints.withdraw, data, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false } }).send()
    })(),
}
