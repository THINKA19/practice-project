import { reactive, readonly } from 'vue'
import { clearSession, getToken, refreshSession, useSession } from '@/pages/auth/session'

export const isDoubleTokenMode = import.meta.env.VITE_AUTH_MODE === 'double'

/** 脚手架兼容入口；状态和持久化均由 auth-session 唯一维护。 */
export function useTokenStore() {
  const session = useSession()

  const adapter = reactive({
    // 直接读取当前时间，兼容路由不调用 updateNowTime 的读取方式。
    get hasLogin() {
      return !!getToken()
    },
    get validToken() {
      return getToken()
    },
    get tokenInfo() {
      return session.tokenInfo ? readonly(session.tokenInfo) : null
    },
    updateNowTime() {
      session.updateNowTime()
      return adapter
    },
    refreshToken: refreshSession,
    async tryGetValidToken(): Promise<string> {
      adapter.updateNowTime()
      if (getToken())
        return getToken()
      try {
        await refreshSession()
        return getToken()
      }
      catch {
        return ''
      }
    },
    // HTTP 401 清理只能退出本地，避免触发注销请求的认证递归。
    logout: clearSession,
  })

  return adapter
}
