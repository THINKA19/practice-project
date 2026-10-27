/**
 * 【文件概述】骑手账号凭证交换，不持久化登录状态。
 * 【方法与导出清单】login、serviceReady
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import type { IAuthLoginRes } from '@/pages/auth/session'
import { isDemo, loginRequest } from '../api/login.api'

export { isDemo } from '../api/login.api'

export const serviceReady = isDemo || !!(import.meta.env.VITE_RIDER_LOGIN_URL && import.meta.env.VITE_RIDER_PROFILE_URL)

/** 使用账号密码获取候选凭证；身份由 session 再查询确认。 */
export async function login(username: string, password: string): Promise<IAuthLoginRes> {
  if (!username.trim() || !password)
    throw new Error('请输入账号和密码')

  return loginRequest({ username: username.trim(), password })
}
