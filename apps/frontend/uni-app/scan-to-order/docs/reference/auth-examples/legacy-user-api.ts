import type { IUpdateInfo, IUpdatePassword, IUserInfoRes } from '../models/user'
import { http } from '@/http/http'
import { endpoints } from './endpoints'

/**
 * 获取用户信息
 */
export function getUserInfo(token?: string) {
  return http.get<IUserInfoRes>(endpoints.userInfo, undefined, token ? { Authorization: `Bearer ${token}` } : undefined)
}

/**
 * 修改用户信息
 */
export function updateInfo(data: IUpdateInfo) {
  return http.post(endpoints.updateInfo, data)
}

/**
 * 修改用户密码
 */
export function updateUserPassword(data: IUpdatePassword) {
  return http.post(endpoints.updatePassword, data)
}
