/**
 * ============================================================================
 * 【文件概述】只读会话 facade；不提供 token setter 或可变资料。
 * 【方法与导出清单】useSessionState。
 * 【综合使用示例】import { useSessionState } from '@/pages/auth/session'
 * ============================================================================
 */
import { computed, reactive, readonly } from 'vue'
import { useSessionStore } from './use-store'
import { clearSession, createSession, getIdentity, getSessionRevision, getToken, logoutSession, refreshSession, refreshUserInfo } from './use-actions'
import { canUseCustomerData } from '../../agreement'
/** 获取只读会话视图及受控命令。无参数。@returns 响应式视图。@example const session = useSessionState(); session.identity */
export function useSessionState() {
  const store = useSessionStore()
  const available = computed(() => store.snapshot?.identity !== 'customer' || canUseCustomerData())

  const state = readonly(reactive({
    identity: computed(() => getIdentity()),
    authenticating: computed(() => store.authenticating),
    sessionRevision: computed(() => getSessionRevision()),
    userInfo: computed(() => (available.value ? store.snapshot?.userInfo : null) ?? { userId: -1, username: '', nickname: '', avatar: '/static/images/default-avatar.png' }),
  }))

  return reactive({
    get identity() {
      return state.identity
    },
    get tokenInfo() {
      return available.value && store.snapshot ? { ...store.snapshot.tokenInfo } : null
    },
    get authenticating() {
      return state.authenticating
    },
    get sessionRevision() {
      return state.sessionRevision
    },
    get hasLogin() {
      void store.now
      return !!getToken()
    },
    get validToken() {
      void store.now
      return getToken()
    },
    get userInfo() {
      return state.userInfo
    },
    updateNowTime: () => {
      store.now = Date.now()
      const validToken = getToken()
      return { hasLogin: !!validToken, identity: state.identity, validToken }
    },
    authenticate: createSession,
    clearSession,
    refreshToken: refreshSession,
    logout: logoutSession,
    fetchUserInfo: refreshUserInfo,
  })
}
