/**
 * 【文件概述】骑手身份访问与退出编排，不维护第二份会话。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { computed } from 'vue'
import { AUTH_ROUTES, useSession } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'

export function useRiderAuth() {
  const session = useSession()

  const isLogin = computed(() => session.hasLogin && session.identity === 'rider')

  function ensureLogin() {
    session.updateNowTime()
    if (isLogin.value)
      return true

    uni.redirectTo({ url: AUTH_ROUTES.rider })

    return false
  }
  async function exit(backToClient = false) {
    const result = await uni.showModal({ title: '提示', content: '确定退出骑手登录吗？' })

    if (!result.confirm)
      return

    try {
      await session.logout()
    }
    catch (error) {
      uni.showToast({ title: error instanceof Error ? error.message : '本地会话已清除', icon: 'none' })
    }
    uni.reLaunch({ url: backToClient ? ClientRoutes.Account.my : AUTH_ROUTES.rider })
  }
  return { isLogin, profile: computed(() => isLogin.value ? session.userInfo : null), ensureLogin, logout: () => exit(), goBackClient: () => exit(true) }
}
