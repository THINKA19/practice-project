import { shopText as st } from '@/locale/shop-text'
import { http } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { permissionEndpoint } from './endpoints'
export const merchantGrantRequests = {
  async shops(token: string): Promise<unknown> {
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 商家分包开发接缝，生产移除。
      return (await import('../mock')).shops(token)
    }
    return http.Get<unknown>(permissionEndpoint('SHOPS'), { headers: { Authorization: 'Bearer ' + token }, cacheFor: 0, meta: { toast: false } }).send()
  },
  async grant(token: string, shopId: string): Promise<unknown> {
    if (import.meta.env.DEV && USE_MOCK) {
      // eslint-disable-next-line project-mock/boundaries -- 商家分包开发接缝，生产移除。
      const result = (await import('../mock')).shops(token).find(shop => shop.id === shopId)
      if (!result) throw new Error(st('门店授权不存在'))
      return result
    }
    return http.Get<unknown>(permissionEndpoint('GRANT'), { params: { shopId }, headers: { Authorization: 'Bearer ' + token }, cacheFor: 0, meta: { toast: false } }).send()
  },
}
