import type { ShopDashboard } from '../../models/index'
import { ref, watch } from 'vue'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { dashboardApi } from '../../api/dashboard'
import { useSessionState } from '@/pages/auth/session'
import { ShopRoutes } from '@/pages-shop/routes'

const redirect = (url: string) => uni.redirectTo({ url })

export function useDashboard() {
  const store = useMerchantShopStore()
  const session = useSessionState()
  const empty = (): ShopDashboard => ({ shopName: '', statusText: '', open: false, today: { orders: 0 } })
  const shopInfo = ref<ShopDashboard>(empty())
  const error = ref('')
  const dashboardReady = ref(false)
  let request = 0
  watch(() => store.revision, () => {
    request++
    shopInfo.value = empty()
    dashboardReady.value = false
    error.value = ''
  }, { flush: 'sync' })
  /** 查询当前授权门店的概览，丢弃切店或再次刷新前发出的请求。 */
  async function loadCurrentDashboard() {
    if (!store.can('order.read'))
      return
    const started = ++request
    const context = store.capture('order.read')
    try {
      const result = await dashboardApi.overview(context)
      if (started !== request || !store.matches(context))
        return
      shopInfo.value = {
        shopName: result.shopName,
        statusText: result.statusText,
        open: result.open,
        today: {
          orders: store.current?.roleTemplate === 'owner' ? result.today.orders : 0,
          ...(store.can('statistics.read') ? { revenue: result.today.revenue } : {}),
        },
      }
      dashboardReady.value = true
      error.value = ''
    }
    catch (reason) {
      if (started === request && store.matches(context))
        error.value = reason instanceof Error ? reason.message : '工作台加载失败'
    }
  }
  /** 页面显示时重新检查会话和门店授权。 */
  async function loadDashboard() {
    session.updateNowTime()
    if (!(session.hasLogin && session.identity === 'shop')) {
      redirect(ShopRoutes.Access.login)
      return
    }
    await store.refresh()
    await loadCurrentDashboard()
  }
  return { shopInfo, dashboardReady, error, loadDashboard, loadCurrentDashboard, store }
}
