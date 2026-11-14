import { shopText as st } from '@/locale/shop-text'
import { USE_MOCK } from '@/mock/config'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import type { GoodsEditForm, GoodsPriceUpdate } from '../models/edit'
import type { ShopGoodsCatalog, ShopGoodsItem } from '../models/index'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

/** 商家商品接口：门店身份统一从请求上下文展开。 */
export const goodsApi = {
  list: (ctx: ShopRequestContext) =>
    (async () => {
      const data = { shopId: ctx.shopId, includeCategories: true }
      if (import.meta.env.DEV && USE_MOCK) {
        // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.list, data, ctx.token) as ShopGoodsCatalog
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Get<ShopGoodsCatalog>(endpoints.list, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
    })(),
  detail: (ctx: ShopRequestContext, id: number) =>
    (async () => {
      const data = { shopId: ctx.shopId, id }
      if (import.meta.env.DEV && USE_MOCK) {
        // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.detail, data, ctx.token) as { form: GoodsEditForm, version: number }
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Get<{ form: GoodsEditForm, version: number }>(endpoints.detail, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
    })(),
  save: (ctx: ShopRequestContext, id: number, version: number | undefined, form: GoodsPriceUpdate) =>
    (async () => {
      if (!Number.isSafeInteger(id) || id <= 0)
        throw new Error(st('暂无商品'))
      const { price } = form
      const data = { shopId: ctx.shopId, id, version, form: JSON.stringify({ price }) }
      if (import.meta.env.DEV && USE_MOCK) {
        // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.save, data, ctx.token) as ShopGoodsItem
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Post<ShopGoodsItem>(endpoints.save, data, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false } }).send()
    })(),
  action: (ctx: ShopRequestContext, item: Pick<ShopGoodsItem, 'id' | 'version'>, value: number) =>
    (async () => {
      const data = { shopId: ctx.shopId, id: item.id, version: item.version, action: 'stock', value }
      if (import.meta.env.DEV && USE_MOCK) {
        // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
        return (await import('../mock')).handle(endpoints.action, data, ctx.token) as ShopGoodsItem
      }
      if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
        throw new Error(st('商家业务服务尚未配置'))
      return http.Post<ShopGoodsItem>(endpoints.action, data, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false } }).send()
    })(),
}
