/** 开发数据源持久化：只保存 Mock 后端数据，不作为客户端登录状态。 */
import { defineStore } from 'pinia'
import type { IUserInfoRes } from '../models/types'

export interface MockSessionEntry {
  user: IUserInfoRes
  expires: number
  refreshExpires: number
  double: boolean
}
export interface MockSessionData {
  sessions: [string, MockSessionEntry][]
  users: [string, IUserInfoRes][]
}
export const useMockSessionData = defineStore('mock-auth-backend-v1', {
  state: (): MockSessionData => ({ sessions: [], users: [] }),
  persist: true,
})
