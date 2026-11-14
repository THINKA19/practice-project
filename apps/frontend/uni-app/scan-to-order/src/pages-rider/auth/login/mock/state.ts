/**
 * ============================================================================
 * 【文件概述】骑手登录的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - login：用骑手账号交换候选凭证，不直接提交共享会话。
 * 【综合使用示例】
 * import { login } from '@/pages-rider/auth/login/mock/state'
 * await login('rider', '123456') // 演示配置下返回骑手候选凭证
 * ============================================================================
 */
import { sessionState } from '@/pages/auth/session/mock'

const demoRiderId = 30001
/**
 * 用骑手账号交换候选凭证，不直接提交共享会话。
 * @param username {string} 登录账号
 * @param password {string} 登录密码，保留原值
 * @returns Promise<IAuthLoginRes>；凭证交换失败时拒绝，不提交客户端会话。
 * @example await login('rider', '123456') // 演示配置下返回骑手候选凭证
 */
export async function login(username: string, password: string) {
  if (username !== 'rider' || password !== '123456')
    throw new Error('账号或密码错误')

  return sessionState.issue('rider', import.meta.env.VITE_AUTH_MODE === 'double', demoRiderId)
}
