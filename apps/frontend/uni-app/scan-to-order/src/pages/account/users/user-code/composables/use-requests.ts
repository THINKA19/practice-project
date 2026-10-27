import { memberCodeRequests } from '../api/member-code.api'
/** 会员码业务 API，复用现有 Alova 实例，不处理全局认证或修改请求适配器。 */
import { getIdentity, getToken } from '@/pages/auth/session'
import { parseMemberCode } from '../models/mappers'

/** 动态会员码业务门面：限制有效顾客会话并校验响应，不发起未配置的正式请求。 */
export const memberCodeApi = {
  get available() {
    return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
  },
  /**
   * 无业务入参，获取当前客户开发样本，禁用缓存；生产服务未接入时不发请求。
   * @returns 经过边界校验的开发码；身份、请求或数据错误时拒绝。
   * @example await memberCodeApi.dynamic()
   */
  async dynamic() {
    if (!memberCodeApi.available)
      throw new Error('动态会员码服务暂未接入')
    const token = getToken()
    if (!token || getIdentity() !== 'customer')
      throw new Error('请先登录顾客账户')
    const data = await memberCodeRequests.dynamic(token)
    return parseMemberCode(data)
  },
}
