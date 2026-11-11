import { computed, onScopeDispose, ref, watch } from 'vue'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { assetApi, isAssetDemo } from '@/pages/account/assets/asset'

/** 读取顾客资料和资产，换账户或离页后忽略旧请求。 */
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
    if (disposed)
      return Promise.resolve()
    session.updateNowTime()
    const canPreview = demo && !session.hasLogin && !session.identity
    if (!user.value && !canPreview)
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
