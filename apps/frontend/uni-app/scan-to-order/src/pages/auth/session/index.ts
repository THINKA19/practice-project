/**
 * ============================================================================
 * 【文件概述】三端共享 session 的公开入口，不导出内部 store、API、存储或 Mock。
 * 【方法与导出清单】useSession。
 * 【综合使用示例】import { useSession } from '@/pages/auth/session/index'
 * ============================================================================
 */
export { useSession } from './composables/useSession'
export { canAccessIdentity } from './domain/access'
export { requireIdentity } from './guard'
export { redirectToLogin } from './loginNavigation'
export type { LoginNavigationOptions } from './loginNavigation'
export { isSessionIdentity } from './models/identity'
export type { SessionIdentity } from './models/identity'
export { isDoubleTokenRes, isSingleTokenRes } from './models/session'
export type { IAuthLoginRes, IDoubleTokenRes, ISingleTokenRes } from './models/session'
export type { IUserInfoRes, UserRole } from './models/user'
export { AUTH_ROUTES, identityForPath } from './routes'
export { clearSession, createSession, getIdentity, getSessionRevision, getToken, logoutSession, refreshSession, refreshUserInfo, restoreSession } from './service'
