/**
 * 【文件概述】仅开发环境使用的三端会话签发、刷新与身份状态。
 * 【方法与导出清单】createSessionState、sessionState
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import type { IAuthLoginRes, IUserInfoRes, SessionIdentity } from '../index'

/** 创建独立开发会话状态；时钟可由测试注入。@example createSessionState() */
export function createSessionState(now = Date.now) {
  const sessions = new Map<string, {
    user: IUserInfoRes
    expires: number
    refreshExpires: number
    double: boolean
  }>()

  let sequence = 0

  function issue(identity: SessionIdentity, double = false, userId = identity === 'customer' ? 10001 : identity === 'shop' ? 20001 : 30001): IAuthLoginRes {
    const token = `wx-demo-session-${now()}-${++sequence}-${Math.random().toString(36).slice(2)}`

    const user = { userId, username: `${identity}_demo`, nickname: identity === 'customer' ? '微信顾客' : identity === 'shop' ? '模拟商家' : '模拟骑手', identity, roles: [identity] }

    sessions.set(token, { user, expires: now() + 3600000, refreshExpires: now() + 7200000, double })

    return double ? { accessToken: token, refreshToken: `refresh-${token}`, accessExpiresIn: 3600, refreshExpiresIn: 7200 } : { token, expiresIn: 3600 }
  }
  function profile(token: string): IUserInfoRes | null {
    const entry = sessions.get(token)
    return entry && now() < entry.expires ? { ...entry.user } : null
  }
  function refresh(refreshToken: string) {
    const token = refreshToken.replace(/^refresh-/, '')

    const old = sessions.get(token)

    if (!refreshToken.startsWith('refresh-') || !old || !old.double || now() >= old.refreshExpires)
      return null

    sessions.delete(token)

    return issue(old.user.identity!, true, old.user.userId)
  }
  return { issue, profile, refresh, logout: (token: string) => sessions.delete(token), reset: () => sessions.clear() }
}
export const sessionState = createSessionState()
