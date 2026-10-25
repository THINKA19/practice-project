import { reactive } from 'vue'
import { clearSession, refreshUserInfo, useSession } from '@/pages/auth/session'

/** 历史资料入口；资料属于唯一会话，不提供绕过身份校验的 setter。 */
export function useUserStore() {
  const session = useSession()
  return reactive({
    get userInfo() {
      return session.userInfo
    },
    fetchUserInfo: refreshUserInfo,
    // 资料不能与凭证分开清理，否则会产生身份不完整的会话。
    clearUserInfo: clearSession,
  })
}
