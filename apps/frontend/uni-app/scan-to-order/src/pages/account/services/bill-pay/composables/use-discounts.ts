/** 优惠规则通过所属模块接口读取。 */
import { onScopeDispose, ref } from 'vue'
import { billApi } from './use-requests'
import { matchDiscount } from '../domain/bill-pay.rules'
import type { PayBillDiscount } from '../models/types'

/** 维护买单优惠规则的加载状态；只应用最新响应，规则未就绪时由调用方禁止确认买单。 */
export function useBillPayDiscounts() {
  const rechargeSendRules = ref<PayBillDiscount[]>([])
  const loading = ref(false)
  const failed = ref(false)
  const loaded = ref(false)
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  async function loadDiscounts() {
    if (disposed)
      return
    const request = ++revision
    loading.value = true
    failed.value = false
    try {
      const rules = await billApi.rules()
      if (!disposed && request === revision) {
        rechargeSendRules.value = rules
        loaded.value = true
      }
    }
    catch {
      if (!disposed && request === revision) {
        failed.value = true
        rechargeSendRules.value = []
      }
    }
    finally {
      if (!disposed && request === revision)
        loading.value = false
    }
  }
  return { rechargeSendRules, loading, failed, loaded, loadDiscounts, matchRule: (amount: number) => matchDiscount(rechargeSendRules.value, amount) }
}
