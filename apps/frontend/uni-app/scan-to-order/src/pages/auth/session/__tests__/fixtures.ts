import type { IUserInfoRes, SessionIdentity } from '../index'
import { useSessionStore } from '../store'
/** 测试专用，模拟已通过服务端校验的会话快照。 */
export function seedSession(user: Partial<IUserInfoRes> = {}, identity: SessionIdentity = 'customer', double = false) {
  const state = useSessionStore()

  state.snapshot = { version: 1, identity, tokenInfo: double ? { accessToken: 'old', refreshToken: 'refresh', accessExpiresIn: 3600, refreshExpiresIn: 7200 } : { token: 'old', expiresIn: 3600 }, userInfo: { userId: 1, username: 'u', nickname: 'U', ...user, identity }, expiresAt: Date.now() + 3600000, refreshExpiresAt: double ? Date.now() + 7200000 : 0 }

  state.now = Date.now()

  state.revision++

  return state
}
