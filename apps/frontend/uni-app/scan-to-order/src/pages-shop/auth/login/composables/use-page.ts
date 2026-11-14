/**
 * 【文件概述】商家登录页面编排，使用唯一会话，校验跳转目标。
 * 【方法与导出清单】useShopLoginPage
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import { computed, onScopeDispose, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useSessionState } from '@/pages/auth/session'
import { MERCHANT_PAGE_PERMISSIONS, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { ShopRoutes } from '@/pages-shop/routes'
import { getAllPages } from '@/utils'
import { isDemo, login, serviceReady } from './use-actions'
/** 验证账号在已授权门店的岗位，并按当前门店岗位进入工作台。 */
export function useShopLoginPage() {
  const session = useSessionState()

  const store = useMerchantShopStore()
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

  let target: string = ShopRoutes.Workspace.workspace

  onLoad((query) => {
    try {
      const value = decodeURIComponent(String(query?.redirect ?? ''))

      const pathname = value.split(/[?#]/)[0]

      if (pathname.startsWith('/pages-shop/') && !pathname.includes('/auth/login/') && getAllPages().some(page => page.path === pathname))
        target = value
    }
    catch {
      target = ShopRoutes.Workspace.workspace
    }
  })

  async function enterWorkspace() {
    if (!authenticated.value || disposed)
      return

    if (target !== ShopRoutes.Workspace.workspace)
      await store.refresh()
    if (!authenticated.value || disposed)
      return

    const permission = MERCHANT_PAGE_PERMISSIONS[target.split(/[?#]/)[0]]
    const destination = store.current && (!permission || store.can(permission))
      ? target
      : ShopRoutes.Workspace.workspace
    uni.redirectTo({ url: destination })
  }

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

      await enterWorkspace()
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
  return { enterWorkspace, username, password, loading, error, authenticated, session, serviceReady, isDemo, submit, logout }
}
