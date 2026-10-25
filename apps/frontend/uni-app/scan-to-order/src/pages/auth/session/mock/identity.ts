/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/auth/session/mock/identity.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】mockCustomerOwner。
 * 【综合使用示例】
 * import { mockCustomerOwner } from '@/pages/auth/session/mock/identity'
 * ============================================================================
 */
import { sessionState } from './state'
/**
 * 将开发凭证解析成稳定的顾客标识。
 * @param authorization 请求携带的开发凭证。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example mockCustomerOwner('guest') // 'guest'
 */
export function mockCustomerOwner(authorization: unknown): string {
  const value = String(authorization ?? 'guest')

  const profile = sessionState.profile(value.replace(/^Bearer /, ''))

  if (profile && profile.identity !== 'customer')
    throw new Error('当前身份不能访问顾客数据')

  return profile ? `customer:${profile.userId}` : value
}
