/**
 * ============================================================================
 * 【文件概述】骑手登录的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderLoginAuth：骑手准入及退出编排；退出确认与服务端响应均受会话版本约束。
 * 【综合使用示例】
 * import { useRiderLoginAuth } from '@/pages-rider/auth/login/composables/use-auth'
 * const auth = useRiderLoginAuth(); auth.ensureLogin() // 非骑手跳转登录
 * ============================================================================
 */
import { computed, onScopeDispose } from 'vue'
import { t } from '@/locale'
import { AUTH_ROUTES, useSessionState } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'

/**
 * 骑手准入及退出编排；退出确认与服务端响应均受会话版本约束。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const auth = useRiderLoginAuth(); auth.ensureLogin() // 非骑手跳转登录
 */
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
      const result = await uni.showModal({
        title: t('rider.login.exitTitle'),
        content: t('rider.login.exitConfirm'),
        cancelText: t('common.cancel'),
        confirmText: t('common.confirm'),
      })
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
        uni.showToast({ title: t('rider.login.signOutFailed'), icon: 'none' })
      uni.reLaunch({ url: backToClient ? ClientRoutes.Account.my : AUTH_ROUTES.rider })
    }
    catch {
      if (!disposed && revision === session.sessionRevision)
        uni.showToast({ title: t('rider.login.exitFailed'), icon: 'none' })
    }
    finally {
      exiting = false
    }
  }
  return { isLogin, profile: computed(() => isLogin.value ? { name: session.userInfo.nickname || session.userInfo.username, phone: '', joinedAt: '' } : null), ensureLogin, logout: () => exit(), goBackClient: () => exit(true) }
}
