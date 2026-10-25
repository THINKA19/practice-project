/**
 * ============================================================================
 * 【文件概述】pages/auth/session/models/user.ts 的类型、状态或边界职责。
 * 【方法与导出清单】UserRole、IUserInfoRes。
 * 【综合使用示例】import type { UserRole } from '@/pages/auth/session/models/user'
 * ============================================================================
 */
import type { SessionIdentity } from './identity'
/** 服务端角色名称，不等同于三端身份。 */
export type UserRole = string
/** 会话最小用户信息；不承载用户资料编辑。 */
export interface IUserInfoRes {
  userId: number
  username: string
  nickname: string
  identity?: SessionIdentity
  avatar?: string
  role?: UserRole
  roles?: UserRole[]
  operatorId?: string
  merchantId?: string
  riderId?: string
  userLevel?: {
    name?: string
  }
}
