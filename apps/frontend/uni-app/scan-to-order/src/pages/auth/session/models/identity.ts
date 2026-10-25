/**
 * ============================================================================
 * 【文件概述】pages/auth/session/models/identity.ts 的类型、状态或边界职责。
 * 【方法与导出清单】SessionIdentity、isSessionIdentity。
 * 【综合使用示例】import type { SessionIdentity } from '@/pages/auth/session/models/identity'
 * ============================================================================
 */
export type SessionIdentity = 'customer' | 'shop' | 'rider'
/** 校验三端身份。@param value 外部值。@returns 是否有效。@example isSessionIdentity('shop') // true */
export function isSessionIdentity(value: unknown): value is SessionIdentity {
  return value === 'customer' || value === 'shop' || value === 'rider'
}
