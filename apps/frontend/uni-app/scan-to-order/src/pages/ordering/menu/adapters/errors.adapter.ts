/**
 * ============================================================================
 * 【文件概述】ordering 页面使用的平台错误与既有请求错误的只读分类，不改写请求、响应或认证状态。
 * 【方法与导出清单】errorCode、needsLogin、isApiError、PlatformError、platformError。
 * 【综合使用示例】import { needsLogin } from './errors.adapter'; needsLogin(new Error('请求错误[401]')) // true
 * ============================================================================
 */
/** 读取请求业务码。@param error 未知失败。@returns 业务码或零。@example errorCode(new Error('请求错误[700]')) // 700 */
export function errorCode(error: unknown): number {
  if (error && typeof error === 'object' && 'code' in error && Number.isFinite(Number(error.code)))
    return Number(error.code)
  return error instanceof Error ? Number(error.message.split('[')[1]?.split(']')[0] ?? 0) : 0
}
/** 判断需要登录的真实请求错误。@param error 请求失败。@returns 是否为认证错误。@example needsLogin(new Error('网络失败')) // false */
export function needsLogin(error: unknown): boolean {
  return [401, 2000, 10002].includes(errorCode(error))
}
/** 窄化标准错误，业务码另由 errorCode 读取。@param error 未知失败。@returns 是否为 Error。@example isApiError(new Error()) // true */
export function isApiError(error: unknown): error is Error {
  return error instanceof Error
}
/**
 * 平台失败分类，不产生授权结论。@example new PlatformError({ errMsg: 'user cancel' }).reason // Cancelled
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 */
export class PlatformError extends Error {
  readonly reason: 'Cancelled' | 'Denied' | 'Failed'
  readonly detail: string
  constructor(source: unknown) {
    const message = source instanceof Error ? source.message : source && typeof source === 'object' && 'errMsg' in source ? String(source.errMsg) : String(source ?? '操作失败')
    super(message)
    this.reason = /cancel/i.test(message) ? 'Cancelled' : /deny|denied|auth|permission/i.test(message) ? 'Denied' : 'Failed'
    this.detail = /privacy/i.test(message) ? 'privacy' : ''
  }
}
/** 转换平台回调错误。@param error 平台失败。@returns 分类后的错误。@example platformError({ errMsg: 'cancel' }).reason // Cancelled */
export function platformError(error: unknown): PlatformError {
  return error instanceof PlatformError ? error : new PlatformError(error)
}
