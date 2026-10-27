/**
 * 【文件概述】仅开发环境使用的三端会话签发、刷新与身份状态。
 * 【方法与导出清单】createSessionState、sessionState
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import type { IAuthLoginRes, IUserInfoRes, SessionIdentity } from '../index'
import { isUser } from '../domain/credentials.rules'
import { useMockSessionData } from './storage'
import type { MockSessionData } from './storage'

/** 创建独立开发会话状态；时钟可由测试注入。@example createSessionState() */
export function createSessionState(now = Date.now, persistence?: () => MockSessionData) {
  const sessions = new Map<string, {
    user: IUserInfoRes
    expires: number
    refreshExpires: number
    double: boolean
  }>()

  const users = new Map<string, IUserInfoRes>()
  let sequence = 0
  let hydrated = false
  function hydrate() {
    if (hydrated || !persistence)
      return
    hydrated = true
    const saved = persistence()
    if (Array.isArray(saved.sessions)) {
      for (const item of saved.sessions) {
        if (!Array.isArray(item) || item.length !== 2)
          continue
        const [token, entry] = item
        if (typeof token === 'string' && token.startsWith('wx-demo-session-') && entry && isUser(entry.user)
          && Number.isFinite(entry.expires) && Number.isFinite(entry.refreshExpires) && typeof entry.double === 'boolean'
          && Math.max(entry.expires, entry.refreshExpires) > now()) {
          sessions.set(token, entry)
          users.set(`${entry.user.identity}:${entry.user.userId}`, entry.user)
        }
      }
    }
    if (Array.isArray(saved.users)) {
      for (const item of saved.users) {
        if (Array.isArray(item) && typeof item[0] === 'string' && isUser(item[1]))
          users.set(item[0], item[1])
      }
    }
  }
  function persist() {
    if (!persistence)
      return
    const saved = persistence()
    saved.sessions = Array.from(sessions.entries())
    saved.users = Array.from(users.entries())
  }

  function issue(identity: SessionIdentity, double = false, userId = identity === 'customer' ? 10001 : identity === 'shop' ? 20001 : 30001): IAuthLoginRes {
    hydrate()
    const token = `wx-demo-session-${now()}-${++sequence}-${Math.random().toString(36).slice(2)}`

    const user = users.get(`${identity}:${userId}`) ?? { userId, username: `${identity}_demo`, nickname: identity === 'customer' ? '微信顾客' : identity === 'shop' ? '模拟商家' : '模拟骑手', identity, roles: [identity], avatar: identity === 'customer' ? '/static/images/avatar.jpg' : '' }

    users.set(`${identity}:${userId}`, user)
    sessions.set(token, { user, expires: now() + 3600000, refreshExpires: now() + 7200000, double })

    persist()
    return double ? { accessToken: token, refreshToken: `refresh-${token}`, accessExpiresIn: 3600, refreshExpiresIn: 7200 } : { token, expiresIn: 3600 }
  }
  function profile(token: string): IUserInfoRes | null {
    hydrate()
    const entry = sessions.get(token)
    return entry && now() < entry.expires ? { ...entry.user } : null
  }
  function refresh(refreshToken: string) {
    hydrate()
    const token = refreshToken.replace(/^refresh-/, '')

    const old = sessions.get(token)

    if (!refreshToken.startsWith('refresh-') || !old || !old.double || now() >= old.refreshExpires)
      return null

    sessions.delete(token)

    return issue(old.user.identity!, true, old.user.userId)
  }
  return { issue, profile, refresh, logout: (token: string) => {
    hydrate()
    sessions.delete(token)
    persist()
  }, reset: () => {
    sessions.clear()
    users.clear()
    hydrated = true
    persist()
  } }
}
export const sessionState = createSessionState(Date.now, () => useMockSessionData())
