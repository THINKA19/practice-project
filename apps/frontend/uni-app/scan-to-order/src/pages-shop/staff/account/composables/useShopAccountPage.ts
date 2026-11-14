import { computed } from 'vue'
import { useMerchantPage, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeLifecycle } from '@/pages-shop/shop/index'
import { useSessionState } from '@/pages/auth/session'
import { ShopRoutes } from '@/pages-shop/routes'

export function useShopAccountPage() {
  useMerchantNoticeLifecycle(useMerchantPage())
  const operator = useSessionState()
  const store = useMerchantShopStore()
  /** 从工作台进入账号页时返回原页面，直接打开账号页时进入工作台。 */
  function workspace() {
    const previous = getCurrentPages().at(-2)?.route
    if (previous && `/${previous}` === ShopRoutes.Workspace.workspace)
      uni.navigateBack()
    else
      uni.redirectTo({ url: ShopRoutes.Workspace.workspace })
  }
  return { session: computed(() => ({ name: operator.userInfo.nickname || operator.userInfo.username })), store, persistenceError: computed(() => ''), workspace }
}
