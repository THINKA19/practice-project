/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - read：接单规则与提醒设置模拟数据读取；拒绝无效骑手凭证。
 * 【综合使用示例】
 * import { read } from '@/pages-rider/account/settings/mock/index'
 * read(authorization) // 当前模拟账号的数据副本
 * ============================================================================
 */
import { createRules } from './fixtures'
import { sessionState } from '@/pages/auth/session/mock'

/**
 * 接单规则与提醒设置模拟数据读取；拒绝无效骑手凭证。
 * @param authorization {string} Bearer 模拟会话凭证
 * @returns 当前模拟骑手的业务资料或规则；非法凭证抛错。
 * @example read(authorization) // 当前模拟账号的数据副本
 */
export function read(authorization: string) {
  if (sessionState.profile(authorization.replace(/^Bearer /, ''))?.identity !== 'rider')
    throw new Error('骑手登录已失效')
  return createRules()
}
