/** 复用公共 HTTP 获取演示资产；关闭开发 Mock 时不请求虚构的生产接口。 */
import { http } from '@/http/alova'
import { getIdentity, getToken } from '@/pages/auth/session'
import { parseAssets } from '../models/assets'
import { endpoints } from './endpoints'

export const assetsApi = {
  get available() {
    return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
  },
  /** 获取当前客户摘要，禁用缓存并携带当前凭证。 */
  async summary() {
    if (!assetsApi.available)
      throw new Error('资产服务尚未接入')
    const token = getToken()
    if (!token || getIdentity() !== 'customer')
      throw new Error('请先登录')
    const data = await http.Get<unknown>(endpoints.assets, {
      headers: { Authorization: `Bearer ${token}` },
      cacheFor: 0,
      meta: { ignoreAuth: true, toast: false },
    }).send()
    return parseAssets(data)
  },
}
