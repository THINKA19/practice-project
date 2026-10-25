/**
 * 【文件概述】商家账号凭证交换，不持久化登录状态。
 * 【方法与导出清单】login、serviceReady
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import type { IAuthLoginRes } from '@/pages/auth/session'
import { http } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { loginEndpoint } from './endpoints'

export const isDemo = USE_MOCK

export const serviceReady = USE_MOCK || !!(import.meta.env.VITE_SHOP_LOGIN_URL && import.meta.env.VITE_SHOP_PROFILE_URL)

/** 使用账号密码获取候选凭证；身份由 session 再查询确认。 */
export async function login(username: string, password: string): Promise<IAuthLoginRes> {
  if (!username.trim() || !password)
    throw new Error('请输入账号和密码')

  if (USE_MOCK)
    return (await import('../mock')).login(username.trim(), password)

  return http.Post<IAuthLoginRes>(loginEndpoint(), { username: username.trim(), password }, { meta: { ignoreAuth: true, toast: false }, cacheFor: 0 }).send()
}
