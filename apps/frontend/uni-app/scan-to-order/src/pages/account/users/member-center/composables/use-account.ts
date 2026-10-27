/** 会员页面共用的客户资料及资产；换账户和离页后丢弃旧请求。 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { assetApi, isAssetDemo } from '@/pages/account/assets/asset'

/** 提供会员页面的只读资料和资产刷新，页面 onShow 调用 refresh。 */
export function useMemberCenterAccount() {
  const session = useSessionState()
  const demo = isAssetDemo()
  const user = computed(() => session.hasLogin && session.identity === 'customer' ? session.userInfo : null)
  const balance = ref('—')
  const score = ref<number | null>(null)
  const totalConsumed = ref<number | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  let generation = 0
  let disposed = false
  let pending: Promise<void> | null = null

  function clear() {
    generation++
    pending = null
    balance.value = '—'
    score.value = null
    totalConsumed.value = null
    loading.value = false
    failed.value = false
  }
  watch(() => [session.sessionRevision, session.hasLogin, session.identity], clear, { flush: 'sync' })
  onScopeDispose(() => {
    disposed = true
    clear()
  })

  function refresh(): Promise<void> {
    session.updateNowTime()
    if (disposed || (!user.value && !(demo && !session.hasLogin && !session.identity)))
      return Promise.resolve()
    if (pending)
      return pending
    const ticket = generation
    const current = () => !disposed && generation === ticket
    loading.value = true
    failed.value = false
    pending = assetApi.amount().then((data) => {
      if (!current())
        return
      balance.value = data.balance.toFixed(2)
      score.value = data.score
      totalConsumed.value = data.totleConsumed ?? data.totalConsumed ?? null
    }).catch(() => {
      if (current()) {
        // 同一账户刷新失败时保留上次成功值，避免数字先清空再恢复。
        failed.value = true
      }
    }).finally(() => {
      if (current()) {
        loading.value = false
        pending = null
      }
    })
    return pending
  }
  return { user, demo, balance, score, totalConsumed, loading, failed, refresh, login: () => requireIdentity('customer') }
}
