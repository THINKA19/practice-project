import { assetsRequests } from '../api/assets.api'
/** 复用公共 HTTP 获取演示资产；关闭开发 Mock 时不请求虚构的生产接口。 */
import { getIdentity, getToken } from '@/pages/auth/session'
import { parseAssets } from '../models/mappers'

/** 账户资产摘要门面：只在开发样本服务可用时读取，并区分游客预览和顾客凭证。 */
export const assetsApi = {
  get available() {
    return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
  },
  /** 客户携带凭证获取摘要；开发游客请求公开样本，均禁用缓存。 */
  async summary() {
    if (!assetsApi.available)
      throw new Error('资产服务尚未接入')
    const token = getToken()
    const identity = getIdentity()
    const preview = !token && !identity
    if (!preview && (!token || identity !== 'customer'))
      throw new Error('请先登录')
    const data = await assetsRequests.summary(preview, token)
    return parseAssets(data)
  },
}
