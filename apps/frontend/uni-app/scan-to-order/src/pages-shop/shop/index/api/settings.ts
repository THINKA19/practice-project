import { shopText as st } from '@/locale/shop-text'
import { USE_MOCK } from '@/mock/config'
import type { ShopRequestContext } from '@/pages-shop/auth/permissions'
import type { ShopSettingsForm } from '../models/index'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const shopSettingsApi = {
  load: (ctx: ShopRequestContext) =>
    (async () => {
    const data = { shopId: ctx.shopId }
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.settings, data, ctx.token) as { form: ShopSettingsForm, version: number }
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))
    return http.Get<{ form: ShopSettingsForm, version: number }>(endpoints.settings, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false }, params: data }).send()
  })(),
  save: (ctx: ShopRequestContext, version: number, form: unknown) =>
    (async () => {
    const data = { shopId: ctx.shopId, version, form: JSON.stringify(form) }
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 分包开发接缝，生产构建剔除；公共加载器不扫描商家分包。
      return (await import('../mock')).handle(endpoints.save, data, ctx.token) as unknown
    }
    if (import.meta.env.VITE_SHOP_BACKEND_ENABLED !== 'true')
      throw new Error(st('商家业务服务尚未配置'))
    return http.Post<unknown>(endpoints.save, data, { headers: { Authorization: `Bearer ${ctx.token}` }, cacheFor: 0, meta: { toast: false } }).send()
  })(),
}
