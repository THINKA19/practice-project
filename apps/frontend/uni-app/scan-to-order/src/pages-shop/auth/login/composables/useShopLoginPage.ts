/**
 * 【文件概述】商家登录页面编排，使用唯一会话，校验跳转目标。
 * 【方法与导出清单】useShopLoginPage
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useSession } from '@/pages/auth/session'
import { getAllPages } from '@/utils'
import { isDemo, login, serviceReady } from '../api/login'
/** 登录成功留在当前页展示身份；仅恢复真实存在且属于该端的原目标页面。 */
export function useShopLoginPage() {
  const session = useSession()

  const username = ref('')

  const password = ref('')

  const loading = ref(false)

  const error = ref('')

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
    if (loading.value)
      return

    loading.value = true

    error.value = ''

    try {
      await session.authenticate('shop', () => login(username.value, password.value))

      password.value = ''

      if (target)
        uni.redirectTo({ url: target })
    }
    catch (reason) {
      error.value = reason instanceof Error ? reason.message : '登录失败'
    }
    finally {
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
