import { useSession } from '@/pages/auth/session'
import type { ScanOrderDetail } from '../models/order'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { scanApi } from '../api/orders'
import { t } from '@/locale'
import { toast } from '@/utils/project/feedback'
/** 核销成功必须等待服务端确认；切换核销码或离开页面后忽略旧请求。 */
export function useScanResult() {
  const session = useSession()
  const permissionDenied = ref(false)
  const demo = ref(false)
  const allowed = computed(() => session.hasLogin && session.identity === (demo.value ? 'customer' : 'shop'))
  const hxNumber = ref('')
  const orderDetail = ref<ScanOrderDetail | null>(null)
  const submitting = ref(false)
  const loading = ref(false)
  const failed = ref(false)
  const verified = ref(false)
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  const canHx = computed(() => !!hxNumber.value && allowed.value && !permissionDenied.value && !loading.value && !failed.value && !verified.value && !submitting.value && orderDetail.value?.orderInfo.fulfillment !== 'preparing' && [1, 2].includes(orderDetail.value?.orderInfo.status ?? -1))
  function init(query?: { hxNumber?: unknown, demo?: unknown }) {
    revision++
    hxNumber.value = typeof query?.hxNumber === 'string' ? query.hxNumber.trim() : ''
    demo.value = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true' && query?.demo === '1'
    orderDetail.value = null
    verified.value = false
    failed.value = false
    loading.value = false
    submitting.value = false
  }
  async function fetchOrderDetail() {
    if (disposed || submitting.value)
      return
    session.updateNowTime()
    permissionDenied.value = !allowed.value
    if (permissionDenied.value) {
      orderDetail.value = null
      return
    }
    if (!hxNumber.value || disposed)
      return
    const request = ++revision
    const identity = session.sessionRevision
    loading.value = true
    failed.value = false
    try {
      const result = await (demo.value ? scanApi.demoDetail : scanApi.detail)(hxNumber.value)
      if (request === revision && identity === session.sessionRevision) {
        orderDetail.value = result
        verified.value = verified.value || [3, 4].includes(result.orderInfo.status)
      }
    }
    catch {
      if (request === revision)
        failed.value = true
    }
    finally {
      if (request === revision)
        loading.value = false
    }
  }
  async function doneHx() {
    if (disposed)
      return
    session.updateNowTime()
    permissionDenied.value = !allowed.value
    if (!canHx.value)
      return
    const code = hxNumber.value
    const request = revision
    const identity = session.sessionRevision
    submitting.value = true
    try {
      await (demo.value ? scanApi.demoVerify : scanApi.verify)(code)
      if (disposed || request !== revision || code !== hxNumber.value || identity !== session.sessionRevision)
        return
      verified.value = true
      submitting.value = false
      toast(t('orderScan.verified'))
      await fetchOrderDetail()
    }
    catch { /* 失败不改变订单状态。 */ }
    finally {
      if (!disposed && code === hxNumber.value)
        submitting.value = false
    }
  }
  watch(() => session.sessionRevision, () => {
    revision++
    orderDetail.value = null
    verified.value = false
    submitting.value = false
    void fetchOrderDetail()
  })
  return { demo, permissionDenied, hxNumber, orderDetail, canHx, loading, failed, verified, submitting, init, fetchOrderDetail, doneHx }
}
