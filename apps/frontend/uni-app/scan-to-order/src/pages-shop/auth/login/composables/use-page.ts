/**
 * 【文件概述】商家登录页面编排，使用唯一会话，校验跳转目标。
 * 【方法与导出清单】useShopLoginPage
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import { computed, onScopeDispose, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useSessionState } from '@/pages/auth/session'
import { getAllPages } from '@/utils'
import { isDemo, login, serviceReady } from './use-actions'
/** 登录成功留在当前页展示身份；仅恢复真实存在且属于该端的原目标页面。 */
export function useShopLoginPage() {
  const session = useSessionState()

  const username = ref('')

  const password = ref('')

  const loading = ref(false)

  const error = ref('')
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    password.value = ''
  })

  const authenticated = computed(() => session.hasLogin && session.identity === 'shop')

  onShow(() => {
    session.updateNowTime()

    if (session.identity === 'shop' && !session.hasLogin && !session.authenticating)
      session.clearSession()
  })

  let target = ''

  onLoad((query) => {
    try {
      const value = decodeURIComponent(String(query?.redirect ?? ''))

      const pathname = value.split(/[?#]/)[0]

      if (pathname.startsWith('/pages-shop/') && !pathname.includes('/auth/login/') && getAllPages().some(page => page.path === pathname))
        target = value
    }
    catch {
      target = ''
    }
  })

  async function submit() {
    if (disposed || loading.value)
      return

    loading.value = true

    error.value = ''

    try {
      await session.authenticate('shop', () => login(username.value, password.value))
      // 会话由共享模块提交；离页仅停止本页面的提示和回跳，不撤销已完成的登录。
      if (disposed)
        return

      password.value = ''

      if (target && session.hasLogin && session.identity === 'shop')
        uni.redirectTo({ url: target })
    }
    catch (reason) {
      if (!disposed)
        error.value = reason instanceof Error ? reason.message : '登录失败'
    }
    finally {
      if (!disposed)
        loading.value = false
    }
  }
  async function logout() {
    try {
      await session.logout()
    }
    catch (reason) {
      error.value = reason instanceof Error ? reason.message : '服务端退出失败，本地会话已清除'
    }
  }
  return { username, password, loading, error, authenticated, session, serviceReady, isDemo, submit, logout, apply: () => uni.navigateTo({ url: '/pages-shop/onboarding/index' }) }
}
