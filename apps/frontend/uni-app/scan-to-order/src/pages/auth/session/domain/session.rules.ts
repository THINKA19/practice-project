import type { IAuthLoginRes, IDoubleTokenRes, ISingleTokenRes, SessionIdentity } from '../models/types'

/** 校验三端身份。@param value 外部值。@returns 是否有效。@example isSessionIdentity('shop') // true */
export function isSessionIdentity(value: unknown): value is SessionIdentity {
  return value === 'customer' || value === 'shop' || value === 'rider'
}

/** 收窄单 token。@param value 已校验凭证。@returns 是否单 token。@example isSingleTokenRes({ token: 't', expiresIn: 1 }) // true */
export function isSingleTokenRes(value: IAuthLoginRes): value is ISingleTokenRes {
  return 'token' in value && !('accessToken' in value)
}

/** 收窄双 token。@param value 已校验凭证。@returns 是否双 token。@example isDoubleTokenRes({ token: 't', expiresIn: 1 }) // false */
export function isDoubleTokenRes(value: IAuthLoginRes): value is IDoubleTokenRes {
  return 'accessToken' in value && 'refreshToken' in value
}
