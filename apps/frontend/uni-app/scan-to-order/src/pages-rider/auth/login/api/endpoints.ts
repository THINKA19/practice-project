/**
 * ============================================================================
 * 【文件概述】骑手登录的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - loginEndpoint：读取并验证真实骑手登录路径，未配置时拒绝调用。
 * - endpoints：骑手登录接口路径唯一事实源，供 API 和 Mock 共同引用。
 * 【综合使用示例】
 * import { loginEndpoint } from '@/pages-rider/auth/login/api/endpoints'
 * loginEndpoint() // 配置有效时返回站内绝对路径，否则抛错
 * ============================================================================
 */
/**
 * 读取并验证真实骑手登录路径，未配置时拒绝调用。
 * 无参数。
 * @returns string；配置有效时返回站内绝对路径，否则抛错
 * @example loginEndpoint() // 配置有效时返回站内绝对路径，否则抛错
 */
export function loginEndpoint(): string {
  const value = import.meta.env.VITE_RIDER_LOGIN_URL

  if (typeof value !== 'string' || !/^\/(?!\/)/.test(value))
    throw new Error('骑手登录服务尚未配置')

  return value
}

/**
 * 骑手登录接口路径唯一事实源，供 API 和 Mock 共同引用。
 * @example Object.values(endpoints) // 骑手登录接口路径列表
 */
export const endpoints = { login: '/operator/rider/login' } as const
