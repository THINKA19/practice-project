/** Session 内部持久化恢复及旧存储迁移；不依赖请求层或 Store 实例。 */
import type { IUserInfoRes, SessionSnapshot } from '../models/types'

import { isCredential, isSnapshot } from '../domain/credentials.rules'
import { isDoubleTokenRes, isSessionIdentity } from '../domain/session.rules'

export interface RestorableSession {
  snapshot: SessionSnapshot | null
  now: number
  restored: boolean
  $persist?: () => void
}
function parse(value: unknown): unknown {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value
  }
  catch {
    return null
  }
}
/** 清理旧版本会话键；恢复完成及退出时共用。 */
export function removeLegacy() {
  for (const key of ['token', 'user', 'accessTokenExpireTime', 'refreshTokenExpireTime'])
    uni.removeStorageSync(key)
}
/** 校验并恢复指定会话状态；旧数据仅迁移一次。@param state Session 内部状态。@example restoreSessionState(store) */
export function restoreSessionState(state: RestorableSession): void {
  if (state.restored)
    return

  state.restored = true

  state.now = Date.now()

  if (state.snapshot && isSnapshot(state.snapshot)) {
    if (Math.max(state.snapshot.expiresAt, state.snapshot.refreshExpiresAt) <= state.now)
      state.snapshot = null

    state.$persist?.()
    removeLegacy()

    return
  }
  state.snapshot = null
  const raw = parse(uni.getStorageSync('token')) as Record<string, unknown> | null

  const user = parse(uni.getStorageSync('user')) as {
    userInfo?: unknown
  } | null

  if (raw && typeof raw === 'object' && isCredential(raw.tokenInfo)) {
    const identity = isSessionIdentity(raw.identity) ? raw.identity : raw.identity == null ? 'customer' : null

    const profile = user?.userInfo

    const normalized = profile && typeof profile === 'object' ? { ...profile, identity: (profile as IUserInfoRes).identity ?? (identity === 'customer' ? 'customer' : undefined) } : null

    const snapshot = { version: 1, identity, tokenInfo: raw.tokenInfo, userInfo: normalized, expiresAt: Number(uni.getStorageSync('accessTokenExpireTime')), refreshExpiresAt: isDoubleTokenRes(raw.tokenInfo) ? Number(uni.getStorageSync('refreshTokenExpireTime')) : 0 }

    if (isSnapshot(snapshot) && Math.max(snapshot.expiresAt, snapshot.refreshExpiresAt) > state.now)
      state.snapshot = snapshot
  }
  state.$persist?.()

  removeLegacy()
}
