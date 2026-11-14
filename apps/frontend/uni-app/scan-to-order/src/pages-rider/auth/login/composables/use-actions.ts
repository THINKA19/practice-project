/**
 * ============================================================================
 * 【文件概述】骑手登录的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - serviceReady：登录配置就绪标记，不代表真实后端已通过验证。
 * - login：用骑手账号交换候选凭证，不直接提交共享会话。
 * 【综合使用示例】
 * import { serviceReady } from '@/pages-rider/auth/login/composables/use-actions'
 * serviceReady // 开发演示启用或真实登录配置齐全时为 true
 * ============================================================================
 */
import type { IAuthLoginRes } from '@/pages/auth/session'
import type { RiderLoginCredentials } from '../models/types'
import { t } from '@/locale'
import { loginRequest, riderLoginAvailable } from '../api/login.api'
import { loginCredentials } from '../domain/login.rules'

export { isDemo } from '../api/login.api'

/**
 * 登录配置就绪标记，不代表真实后端已通过验证。
 * @example serviceReady // 开发演示启用或真实登录配置齐全时为 true
 */
export const serviceReady = riderLoginAvailable

/**
 * 用骑手账号交换候选凭证，不直接提交共享会话。
 * @param username {string} 登录账号
 * @param password {string} 登录密码，保留原值
 * @returns Promise<IAuthLoginRes>；凭证交换失败时拒绝，不提交客户端会话。
 * @example await login('rider', '123456') // 演示配置下返回骑手候选凭证
 */
export async function login(username: string, password: string): Promise<IAuthLoginRes> {
  let credentials: RiderLoginCredentials
  try {
    credentials = loginCredentials(username, password)
  }
  catch {
    throw new Error(t('rider.login.missingCredentials'))
  }
  return loginRequest(credentials)
}
