import { onScopeDispose, ref } from 'vue'
import { t } from '@/locale'
import { shopText as st } from '@/locale/shop-text'
import { useSessionState } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'
import { ShopRoutes } from '@/pages-shop/routes'

/** 确认后退出商家会话。返回箭头回到客户端「我的」，退出账号按钮回到商家登录页。 */
export function useShopExit() {
  const session = useSessionState()
  const exiting = ref(false)
  let disposed = false
  onScopeDispose(() => { disposed = true })

  async function exit(url: string) {
    if (disposed || exiting.value || session.identity !== 'shop')
      return

    const revision = session.sessionRevision
    exiting.value = true
    try {
      const { confirm } = await uni.showModal({
        title: st('退出商家账号'),
        content: st('确认退出当前商家账号？'),
        cancelText: t('common.cancel'),
        confirmText: t('common.confirm'),
      })
      if (!confirm || disposed || revision !== session.sessionRevision || session.identity !== 'shop')
        return

      const pending = session.logout()
      const clearedRevision = session.sessionRevision
      const failed = await pending.then(() => false, () => true)
      if (disposed || clearedRevision !== session.sessionRevision || session.identity !== null)
        return

      if (failed)
        uni.showToast({ title: st('服务端退出失败，本地会话已清除'), icon: 'none' })
      uni.reLaunch({ url })
    }
    catch {
      if (!disposed && revision === session.sessionRevision)
        uni.showToast({ title: st('退出操作未完成，请重试'), icon: 'none' })
    }
    finally {
      exiting.value = false
    }
  }

  return {
    exiting,
    goBackClient: () => exit(ClientRoutes.Account.my),
    logout: () => exit(ShopRoutes.Access.login),
  }
}
