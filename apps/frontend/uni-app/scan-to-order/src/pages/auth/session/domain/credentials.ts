/**
 * ============================================================================
 * 【文件概述】pages/auth/session/domain/credentials.ts 的类型、状态或边界职责。
 * 【方法与导出清单】isCredential、isUser、isSnapshot。
 * 【综合使用示例】import { isCredential } from '@/pages/auth/session/domain/credentials'
 * ============================================================================
 */
import type { IAuthLoginRes, SessionSnapshot } from '../models/session'
import { isDoubleTokenRes } from '../models/session'
import type { IUserInfoRes } from '../models/user'
import { isSessionIdentity } from '../models/identity'

const positive = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0

const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

/** 校验凭证边界。@param value 外部响应。@returns 是否为有效凭证。@example isCredential(null) // false */
export function isCredential(value: unknown): value is IAuthLoginRes {
  if (!value || typeof value !== 'object')
    return false

  const v = value as Record<string, unknown>

  if ('token' in v)
    return !('accessToken' in v) && text(v.token) && positive(v.expiresIn)

  return text(v.accessToken) && text(v.refreshToken) && positive(v.accessExpiresIn) && positive(v.refreshExpiresIn)
}
/** 校验身份资料。@param value 外部响应。@returns 是否可提交。@example isUser({}) // false */
export function isUser(value: unknown): value is IUserInfoRes {
  if (!value || typeof value !== 'object')
    return false

  const v = value as Record<string, unknown>

  return Number.isSafeInteger(v.userId) && Number(v.userId) > 0 && text(v.username) && typeof v.nickname === 'string' && isSessionIdentity(v.identity)
    && (v.roles === undefined || (Array.isArray(v.roles) && v.roles.every(p => typeof p === 'string')))
}
/** 校验存储快照。@param value 存储数据。@returns 是否可恢复。@example isSnapshot({ version: 2 }) // false */
export function isSnapshot(value: unknown): value is SessionSnapshot {
  if (!value || typeof value !== 'object')
    return false

  const v = value as Record<string, unknown>

  return v.version === 1 && isSessionIdentity(v.identity) && isCredential(v.tokenInfo) && isUser(v.userInfo)
    && v.userInfo.identity === v.identity && positive(v.expiresAt) && typeof v.refreshExpiresAt === 'number' && Number.isFinite(v.refreshExpiresAt) && (isDoubleTokenRes(v.tokenInfo) ? positive(v.refreshExpiresAt) : v.refreshExpiresAt === 0)
}
