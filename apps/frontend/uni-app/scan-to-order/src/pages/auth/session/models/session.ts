/**
 * ============================================================================
 * 【文件概述】pages/auth/session/models/session.ts 的类型、状态或边界职责。
 * 【方法与导出清单】ISingleTokenRes、IDoubleTokenRes、IAuthLoginRes、SessionSnapshot、isSingleTokenRes、isDoubleTokenRes。
 * 【综合使用示例】import type { ISingleTokenRes } from '@/pages/auth/session/models/session'
 * ============================================================================
 */
import type { SessionIdentity } from './identity'
import type { IUserInfoRes } from './user'
/** 单 token，expiresIn 单位为秒。 */
export interface ISingleTokenRes {
  token: string
  expiresIn: number
}
/** 双 token，有效期单位为秒。 */
export interface IDoubleTokenRes {
  accessToken: string
  refreshToken: string
  accessExpiresIn: number
  refreshExpiresIn: number
}
/** 接口返回的凭证，身份须另行校验。 */
export type IAuthLoginRes = ISingleTokenRes | IDoubleTokenRes
/** 唯一持久化快照，绝对过期时间单位为毫秒。 */
export interface SessionSnapshot {
  version: 1
  identity: SessionIdentity
  tokenInfo: IAuthLoginRes
  userInfo: IUserInfoRes
  expiresAt: number
  refreshExpiresAt: number
}
/** 收窄单 token。@param value 已校验凭证。@returns 是否单 token。@example isSingleTokenRes({ token: 't', expiresIn: 1 }) // true */
export function isSingleTokenRes(value: IAuthLoginRes): value is ISingleTokenRes {
  return 'token' in value && !('accessToken' in value)
}
/** 收窄双 token。@param value 已校验凭证。@returns 是否双 token。@example isDoubleTokenRes({ token: 't', expiresIn: 1 }) // false */
export function isDoubleTokenRes(value: IAuthLoginRes): value is IDoubleTokenRes {
  return 'accessToken' in value && 'refreshToken' in value
}
