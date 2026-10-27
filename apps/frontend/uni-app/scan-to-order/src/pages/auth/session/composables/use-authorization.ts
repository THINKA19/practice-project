/** 从唯一会话读取身份匹配的请求凭证，不发请求、不跳转或维护副本。 */
import type { SessionIdentity } from '../models/types'
import { getIdentity, getToken } from './use-actions'

/**
 * 获取指定身份的 Bearer 请求头；未登录、过期或身份不匹配时抛出错误。
 * @param identity 调用业务要求的身份。
 * @returns 当前会话的 Authorization 请求头，每次调用重新读取。
 * @example getAuthorizationHeaders('customer')
 */
export function getAuthorizationHeaders(identity: SessionIdentity): { Authorization: string } {
  const token = getToken()
  if (!token || getIdentity() !== identity)
    throw new Error(identity === 'customer' ? '请先使用顾客身份登录' : '请先使用对应身份登录')
  return { Authorization: `Bearer ${token}` }
}
