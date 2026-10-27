/** 共享会话的纯类型：身份、凭证、用户资料与持久化快照。 */
export type SessionIdentity = 'customer' | 'shop' | 'rider'

/** 单 token，expiresIn 单位为秒。 */
export interface ISingleTokenRes {
  token: string
  expiresIn: number
}

/** 双 token，有效期单位为秒。 */
export interface IDoubleTokenRes {
  accessToken: string
  refreshToken: string
  accessExpiresIn: number
  refreshExpiresIn: number
}

/** 接口返回的凭证，身份须另行校验。 */
export type IAuthLoginRes = ISingleTokenRes | IDoubleTokenRes

/** 唯一持久化快照，绝对过期时间单位为毫秒。 */
export interface SessionSnapshot {
  version: 1
  identity: SessionIdentity
  tokenInfo: IAuthLoginRes
  userInfo: IUserInfoRes
  expiresAt: number
  refreshExpiresAt: number
}

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
