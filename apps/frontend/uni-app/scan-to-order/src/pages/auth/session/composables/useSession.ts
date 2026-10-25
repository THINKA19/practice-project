/**
 * ============================================================================
 * 【文件概述】只读会话 facade；不提供 token setter 或可变资料。
 * 【方法与导出清单】useSession。
 * 【综合使用示例】import { useSession } from '@/pages/auth/session/composables/useSession'
 * ============================================================================
 */
import { computed, reactive, readonly } from 'vue'
import { useSessionStore } from '../store'
import { clearSession, createSession, getToken, logoutSession, refreshSession, refreshUserInfo } from '../service'
/** 获取只读会话视图及受控命令。无参数。@returns 响应式视图。@example const session = useSession(); session.identity */
export function useSession() {
  const store = useSessionStore()

  const state = readonly(reactive({
    identity: computed(() => store.snapshot?.identity ?? null),
    authenticating: computed(() => store.authenticating),
    sessionRevision: computed(() => store.revision),
    userInfo: computed(() => store.snapshot?.userInfo ?? { userId: -1, username: '', nickname: '', avatar: '/static/images/default-avatar.png' }),
  }))

  return reactive({
    get identity() {
      return state.identity
    },
    get tokenInfo() {
      return store.snapshot ? { ...store.snapshot.tokenInfo } : null
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
