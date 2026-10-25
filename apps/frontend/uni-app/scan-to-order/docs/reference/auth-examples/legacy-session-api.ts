import type { IAuthLoginRes, ICaptcha, IDoubleTokenRes, ILoginForm } from '../models/session'
import { http } from '@/http/http'
import { endpoints } from './endpoints'

/**
 * 获取验证码
 * @returns ICaptcha 验证码
 */
export function getCode() {
  return http.get<ICaptcha>(endpoints.code)
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export function login(loginForm: ILoginForm) {
  return http.post<IAuthLoginRes>(endpoints.login, loginForm)
}

/**
 * 刷新token
 * @param refreshToken 刷新token
 */
export function refreshToken(refreshToken: string) {
  return http.post<IDoubleTokenRes>(endpoints.refreshToken, { refreshToken })
}

/**
 * 退出登录
 */
export function logout() {
  return http.get<void>(endpoints.logout)
}

/**
 * 微信登录
 * @param params 微信登录参数，包含code
 * @returns Promise 包含登录结果
 */
export function wxLogin(data: { code: string }) {
  return http.post<IAuthLoginRes>(endpoints.wxLogin, data)
}
