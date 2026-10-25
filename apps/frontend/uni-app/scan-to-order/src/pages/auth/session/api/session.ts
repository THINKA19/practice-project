/**
 * ============================================================================
 * 【文件概述】主包生命周期 API，无分包依赖；刷新和退出绕过自动认证恢复。
 * 【方法与导出清单】sessionApi。
 * 【综合使用示例】import { sessionApi } from '@/pages/auth/session/api/session'
 * ============================================================================
 */
import type { SessionIdentity } from '../models/identity'
import type { IAuthLoginRes } from '../models/session'
import type { IUserInfoRes } from '../models/user'
import { http as alova } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { endpoints } from './endpoints'

const flags = { meta: { ignoreAuth: true, toast: false }, cacheFor: 0 }

function pathFor(identity: SessionIdentity, action: 'Profile' | 'Refresh' | 'Logout'): string {
  if (identity === 'customer')
    return endpoints[(`customer${action}`) as 'customerProfile' | 'customerRefresh' | 'customerLogout']

  const key = `VITE_${identity.toUpperCase()}_${action.toUpperCase()}_URL`

  const path = import.meta.env[key]

  if (typeof path !== 'string' || !/^\/(?!\/)/.test(path))
    throw new Error(`${identity}会话服务尚未配置：${action}`)

  return path
}
/** 获取候选凭证身份。@param identity 预期端。@param token 候选凭证。@returns 服务端资料。@example await sessionApi.profile('customer', token) */
export const sessionApi = {
  profile: (identity: SessionIdentity, token: string): Promise<IUserInfoRes> => USE_MOCK && token.startsWith('wx-demo-session-')
    ? alova.Get<IUserInfoRes>(endpoints.demoProfile, { ...flags, headers: { Authorization: `Bearer ${token}` } }).send()
    : alova.Get<IUserInfoRes>(pathFor(identity, 'Profile'), { ...flags, headers: { Authorization: `Bearer ${token}` } }).send(),
  refresh: (identity: SessionIdentity, refreshToken: string): Promise<IAuthLoginRes> => USE_MOCK && refreshToken.startsWith('refresh-wx-demo-session-')
    ? alova.Post<IAuthLoginRes>(endpoints.demoRefresh, { refreshToken }, flags).send()
    : alova.Post<IAuthLoginRes>(pathFor(identity, 'Refresh'), { refreshToken }, flags).send(),
  logout: (identity: SessionIdentity, token: string): Promise<unknown> => USE_MOCK && token.startsWith('wx-demo-session-')
    ? alova.Post(endpoints.demoLogout, {}, { ...flags, headers: { Authorization: `Bearer ${token}` } }).send()
    : alova.Get(pathFor(identity, 'Logout'), { ...flags, headers: { Authorization: `Bearer ${token}` } }).send(),
}
