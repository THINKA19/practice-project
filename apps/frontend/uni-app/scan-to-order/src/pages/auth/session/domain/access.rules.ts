/**
 * ============================================================================
 * 【文件概述】pages/auth/session/domain/access.ts 的类型、状态或边界职责。
 * 【方法与导出清单】canAccessIdentity。
 * 【综合使用示例】import { canAccessIdentity } from '@/pages/auth/session/domain/access.rules'
 * ============================================================================
 */
import type { SessionIdentity } from '../models/types'
/** 纯身份访问规则。@param current 当前身份。@param valid 会话有效性。@param target 目标身份。@returns 是否允许。@example canAccessIdentity('shop', true, 'rider') // false */
export function canAccessIdentity(current: SessionIdentity | null, valid: boolean, target: SessionIdentity): boolean {
  return valid && current === target
}
