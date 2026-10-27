export { useSessionAccountScope } from './composables/use-account-scope'
export { clearSession, createSession, getIdentity, getSessionRevision, getToken, logoutSession, refreshSession, refreshUserInfo, restoreSession } from './composables/use-actions'
export { getAuthorizationHeaders } from './composables/use-authorization'
export { requireIdentity } from './composables/use-guard'
export { redirectToLogin } from './composables/use-login-navigation'
export type { LoginNavigationOptions } from './composables/use-login-navigation'
/**
 * ============================================================================
 * 【文件概述】三端共享 session 的公开入口，不导出内部 store、API、存储或 Mock。
 * 【方法与导出清单】useSessionState。
 * 【综合使用示例】import { useSessionState } from '@/pages/auth/session/index'
 * ============================================================================
 */
export { useSessionState } from './composables/use-state'
/** 脚手架 Store 的既有兼容名称；业务组合函数使用 useSessionState。 */
export { useSessionState as useSession } from './composables/use-state'
export { canAccessIdentity } from './domain/access.rules'
export { isSessionIdentity } from './domain/session.rules'
export { isDoubleTokenRes, isSingleTokenRes } from './domain/session.rules'
export type { SessionIdentity } from './models/types'
export type { IAuthLoginRes, IDoubleTokenRes, ISingleTokenRes } from './models/types'
export type { IUserInfoRes, UserRole } from './models/types'

export { AUTH_ROUTES, identityForPath } from './routes'
