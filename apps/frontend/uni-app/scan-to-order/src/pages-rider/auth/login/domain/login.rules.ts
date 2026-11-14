/**
 * ============================================================================
 * 【文件概述】骑手登录的无框架依赖的纯业务规则层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - loginCredentials：整理账号并校验非空输入，密码原样保留。
 * 【综合使用示例】
 * import { loginCredentials } from '@/pages-rider/auth/login/domain/login.rules'
 * loginCredentials(' rider ', '123456') // { username: 'rider', password: '123456' }
 * ============================================================================
 */
import type { RiderLoginCredentials } from '../models/types'
/**
 * 整理账号并校验非空输入，密码原样保留。
 * @param username {string} 登录账号
 * @param password {string} 登录密码，保留原值
 * @returns RiderLoginCredentials；账号已整理，密码保持原值；空输入抛错。
 * @example loginCredentials(' rider ', '123456') // { username: 'rider', password: '123456' }
 */
export function loginCredentials(username: string, password: string): RiderLoginCredentials {
  if (!username.trim() || !password)
    throw new Error('请输入账号和密码')
  return { username: username.trim(), password }
}
