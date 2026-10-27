/**
 * 【文件概述】骑手身份访问与退出编排，不维护第二份会话。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { computed, onScopeDispose } from 'vue'
import { AUTH_ROUTES, useSessionState } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'

/** 骑手准入与退出流程；确认框及注销响应只作用于发起它们的会话，销毁后不导航。 */
export function useRiderLoginAuth() {
  const session = useSessionState()
  let disposed = false
  let exiting = false
  onScopeDispose(() => {
    disposed = true
  })

  const isLogin = computed(() => session.hasLogin && session.identity === 'rider')

  function ensureLogin() {
    session.updateNowTime()
    if (isLogin.value)
      return true

    uni.redirectTo({ url: AUTH_ROUTES.rider })

    return false
  }
  async function exit(backToClient = false) {
    if (disposed || exiting || session.identity !== 'rider')
      return
    const revision = session.sessionRevision
    exiting = true
    try {
      const result = await uni.showModal({ title: '提示', content: '确定退出骑手登录吗？' })
      if (!result.confirm || disposed || revision !== session.sessionRevision || session.identity !== 'rider')
        return

      // logout 会同步清除本地会话；等待服务端时，用户仍可能重新登录其他账号。
      const pending = session.logout()
      const clearedRevision = session.sessionRevision
      let failure: unknown
      try {
        await pending
      }
      catch (error) {
        failure = error
      }
      if (disposed || clearedRevision !== session.sessionRevision || session.identity !== null)
        return
      if (failure)
        uni.showToast({ title: failure instanceof Error ? failure.message : '本地会话已清除', icon: 'none' })
      uni.reLaunch({ url: backToClient ? ClientRoutes.Account.my : AUTH_ROUTES.rider })
    }
    catch (error) {
      if (!disposed && revision === session.sessionRevision)
        uni.showToast({ title: error instanceof Error ? error.message : '退出操作未完成', icon: 'none' })
    }
    finally {
      exiting = false
    }
  }
  return { isLogin, profile: computed(() => isLogin.value ? session.userInfo : null), ensureLogin, logout: () => exit(), goBackClient: () => exit(true) }
}
