/**
 * ============================================================================
 * 【文件概述】会话生命周期业务，唯一状态由内部 Pinia 保存；不导入任何登录页面或分包。
 * 【方法与导出清单】restoreSession、getToken、getSessionRevision、getIdentity、clearSession、createSession、refreshSession、logoutSession、refreshUserInfo。
 * 【综合使用示例】import { restoreSession } from '@/pages/auth/session'
 * ============================================================================
 */
import type { IAuthLoginRes, IUserInfoRes, SessionIdentity, SessionSnapshot } from '../models/types'

import { isDoubleTokenRes, isSessionIdentity, isSingleTokenRes } from '../domain/session.rules'
import { isCredential, isUser } from '../domain/credentials.rules'
import { useSessionStore } from './use-store'
import { removeLegacy, restoreSessionState } from '../storage/session.storage'
import { sessionApi } from '../api/session'
import { canUseCustomerData, getPrivacyRevision } from '../../agreement'

const refreshTasks = new WeakMap<ReturnType<typeof useSessionStore>, {
  revision: number
  task: Promise<void>
}>()

const emptyUser: IUserInfoRes = { userId: -1, username: '', nickname: '', avatar: '/static/images/default-avatar.png' }

/** 显式恢复兼容入口；正常运行由 Session 的持久化钩子自动恢复。 */
export function restoreSession(): void {
  restoreSessionState(useSessionStore())
}
/** 获取当前有效 token，不触发网络。无参数。@returns token 或空字符串。@example getToken() */
export function getToken(): string {
  const state = useSessionStore()

  const current = state.snapshot

  if (current?.identity === 'customer' && !canUseCustomerData())
    return ''

  if (!current || state.authenticating || Date.now() >= current.expiresAt)
    return ''

  return isSingleTokenRes(current.tokenInfo) ? current.tokenInfo.token : current.tokenInfo.accessToken
}
/** 获取当前会话版本。无参数。@returns 请求隔离版本。@example getSessionRevision() */
export function getSessionRevision(): number {
  return useSessionStore().revision + getPrivacyRevision()
}
/** 获取当前身份。无参数。@returns 身份或 null。@example getIdentity() */
export function getIdentity(): SessionIdentity | null {
  const identity = useSessionStore().snapshot?.identity ?? null
  return identity === 'customer' && !canUseCustomerData() ? null : identity
}
/** 清理唯一会话，令所有旧请求失效。无参数。@returns void。@example clearSession() */
export function clearSession(): void {
  const state = useSessionStore()

  state.revision++

  state.authenticating = false

  state.snapshot = null

  state.now = Date.now()

  state.$persist?.()

  removeLegacy()
}
function snapshot(identity: SessionIdentity, credential: IAuthLoginRes, user: IUserInfoRes): SessionSnapshot {
  const now = Date.now()

  return { version: 1, identity, tokenInfo: { ...credential }, userInfo: { ...user, avatar: user.avatar || emptyUser.avatar }, expiresAt: now + (isSingleTokenRes(credential) ? credential.expiresIn : credential.accessExpiresIn) * 1000, refreshExpiresAt: isDoubleTokenRes(credential) ? now + credential.refreshExpiresIn * 1000 : 0 }
}
/** 原子创建会话。@param target 目标身份。@param exchange 获取候选凭证。@returns 候选凭证，失败不提交。@example await createSession('customer', exchange) */
export async function createSession(target: SessionIdentity, exchange: () => Promise<IAuthLoginRes>): Promise<IAuthLoginRes> {
  const state = useSessionStore()

  if (!isSessionIdentity(target))
    throw new Error('无效的登录身份')

  if (target === 'customer' && !canUseCustomerData())
    throw new Error('请先确认隐私政策')

  if (state.authenticating)
    throw new Error('正在登录，请稍后重试')

  if (state.snapshot)
    throw new Error('请先退出当前账号，再登录其他身份')

  state.authenticating = true

  const revision = ++state.revision
  const privacyRevision = getPrivacyRevision()

  try {
    const credentials = await exchange()

    if (revision !== state.revision || (target === 'customer' && (privacyRevision !== getPrivacyRevision() || !canUseCustomerData())))
      throw new Error('登录已取消')

    if (!isCredential(credentials))
      throw new Error('登录凭证格式无效')

    const user = await sessionApi.profile(target, isSingleTokenRes(credentials) ? credentials.token : credentials.accessToken)

    if (revision !== state.revision || (target === 'customer' && (privacyRevision !== getPrivacyRevision() || !canUseCustomerData())))
      throw new Error('登录已取消')

    // 仅保留顾客旧接口省略 identity 的兼容；后台必须显式返回身份。
    const normalized = { ...user, identity: user?.identity ?? (target === 'customer' ? 'customer' : undefined) }

    if (!isUser(normalized) || normalized.identity !== target)
      throw new Error('账号身份与当前登录端不匹配')

    state.snapshot = snapshot(target, credentials, normalized)

    state.now = Date.now()

    state.$persist?.()

    return credentials
  }
  catch (error) {
    if (revision === state.revision)
      clearSession()

    throw error
  }
  finally {
    if (revision === state.revision)
      state.authenticating = false
  }
}
/** 同一会话刷新只执行一次。无参数。@returns Promise<void>，过期或变化时拒绝。@example await refreshSession() */
export function refreshSession(): Promise<void> {
  const state = useSessionStore()

  const current = state.snapshot

  if (current?.identity === 'customer' && !canUseCustomerData())
    return Promise.reject(new Error('请先确认隐私政策'))

  const running = refreshTasks.get(state)

  if (running?.revision === getSessionRevision())
    return running.task

  if (!current || !isDoubleTokenRes(current.tokenInfo) || current.refreshExpiresAt <= Date.now())
    return Promise.reject(new Error('会话不可刷新'))

  const revision = getSessionRevision()

  const task = (async () => {
    const credential = await sessionApi.refresh(current.identity, (current.tokenInfo as {
      refreshToken: string
    }).refreshToken)

    if (revision !== getSessionRevision())
      throw new Error('会话已变化，忽略旧刷新结果')

    if (!isCredential(credential) || !isDoubleTokenRes(credential))
      throw new Error('刷新凭证格式无效')

    state.snapshot = snapshot(current.identity, credential, state.snapshot!.userInfo)

    state.now = Date.now()

    state.$persist?.()
  })()

  refreshTasks.set(state, { revision, task })

  void task.finally(() => {
    if (refreshTasks.get(state)?.task === task)
      refreshTasks.delete(state)
  }).catch(() => {

  })

  return task
}
/** 立即退出本地，再等待服务端注销。无参数。@returns Promise<void>，注销失败仍保持本地退出。@example await logoutSession() */
export async function logoutSession(): Promise<void> {
  const old = useSessionStore().snapshot
  const allowed = old?.identity !== 'customer' || canUseCustomerData()

  clearSession()

  if (old && allowed)
    await sessionApi.logout(old.identity, isSingleTokenRes(old.tokenInfo) ? old.tokenInfo.token : old.tokenInfo.accessToken)
}
/** 刷新当前身份资料。无参数。@returns 资料或 undefined，旧会话响应丢弃。@example await refreshUserInfo() */
export async function refreshUserInfo(): Promise<IUserInfoRes | undefined> {
  const state = useSessionStore()

  const current = state.snapshot

  if (!current || !getToken())
    return

  const revision = getSessionRevision()

  const user = await sessionApi.profile(current.identity, getToken())

  if (revision !== getSessionRevision())
    return

  const normalized = { ...user, identity: user.identity ?? (current.identity === 'customer' ? 'customer' : undefined) }

  if (!isUser(normalized) || normalized.identity !== current.identity || normalized.userId !== current.userInfo.userId)
    throw new Error('会话身份资料无效')

  state.snapshot = { ...state.snapshot!, userInfo: normalized }

  // 返回独立资料，避免调用方通过刷新结果绕过只读会话入口修改状态。
  return { ...normalized, roles: normalized.roles?.slice(), userLevel: normalized.userLevel ? { ...normalized.userLevel } : undefined }
}
