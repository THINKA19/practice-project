import type { OrderDoingData } from '../models/types'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { pickupApi } from '../api/orders.api'
import { useSessionState } from '@/pages/auth/session'
import { ClientRoutes } from '@/pages/routes'
import { navigate } from '@/utils/project/navigation'
/**
 * 订单视图共用加载与迟到响应隔离。
 * @param load 默认读取顾客订单；演示页显式传入专用演示接口。
 * @param requireCustomer 默认要求顾客身份，只有专用演示接口调用方传 false。
 */
export function usePickupOrders(load: typeof pickupApi.list = pickupApi.list, requireCustomer = true) {
  const apiOk = ref(false)
  const loading = ref(false)
  const failed = ref(false)
  const needsLogin = ref(false)
  const data = ref<OrderDoingData | null>(null)
  const session = useSessionState()
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  async function refresh() {
    if (disposed)
      return
    session.updateNowTime()
    const request = ++revision
    const identity = session.sessionRevision
    apiOk.value = false
    loading.value = true
    failed.value = false
    needsLogin.value = false
    data.value = null
    if (requireCustomer && (!session.hasLogin || session.identity !== 'customer')) {
      apiOk.value = true
      loading.value = false
      needsLogin.value = true
      return
    }
    try {
      const result = await load()
      if (request === revision && identity === session.sessionRevision)
        data.value = result
    }
    catch {
      if (request === revision && identity === session.sessionRevision)
        failed.value = true
    }
    finally {
      if (request === revision) {
        apiOk.value = true
        loading.value = false
      }
    }
  }
  watch(() => session.sessionRevision, () => {
    void refresh()
  })
  const orderList = computed(() => data.value?.orderList?.length ? data.value.orderList : null)
  const goodsMap = computed(() => data.value?.goodsMap ?? {})
  const logisticsMap = computed(() => data.value?.logisticsMap ?? {})
  function toIndexPage() {
    return navigate(ClientRoutes.Ordering.order)
  }
  return { loading, failed, needsLogin, apiOk, orderList, goodsMap, logisticsMap, refresh, toIndexPage }
}
