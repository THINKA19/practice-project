import { CLIENT_HOME_URL } from '@/constants/routes'
import { SHOP_LOGIN_URL } from '@/pages-shop/routes'
import { useAuthStore } from '@/store/auth'

/**
 * 商家账号退出：清登录态并回登录页
 *
 * authStore.logout() 内部已经调用过 /auth/logout 且用 try/finally 兜底（接口失败也会清本地），
 * 这里不要再单独调一次接口，否则退出时会发两次登出请求。
 */
export function useAdminAuth() {
  const authStore = useAuthStore()

  async function handleLogout() {
    const { confirm } = await uni.showModal({
      title: '提示',
      content: '确定退出商家后台吗？',
    })
    if (!confirm)
      return

    uni.showLoading({ title: '退出中...', mask: true })
    try {
      await authStore.logout()
    }
    finally {
      // 无论接口成败都要离开后台，避免停留在已清空登录态的页面
      uni.hideLoading()
      uni.redirectTo({ url: SHOP_LOGIN_URL })
    }
  }

  /** 返回顾客端首页 */
  function goBackClient() {
    uni.switchTab({ url: CLIENT_HOME_URL })
  }

  return { handleLogout, goBackClient }
}
