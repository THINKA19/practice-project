/** 资产状态：按账户隔离，合并重复刷新，忽略过期响应。 */
import type { Ref } from 'vue'
import type { Assets } from '../models/assets'
import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import { assetsApi } from '../api/assets'

/** accountKey 包含客户 ID 和会话版本；退出时传 null，立即清除数据。 */
export function useAssets(accountKey: Readonly<Ref<string | null>>) {
  const data = ref<Assets | null>(null)
  const status = ref<'idle' | 'loading' | 'ready' | 'error' | 'unavailable'>('idle')
  let generation = 0
  let disposed = false
  let pending: Promise<void> | null = null

  function refresh(): Promise<void> {
    if (!accountKey.value || disposed)
      return Promise.resolve()
    if (!assetsApi.available) {
      status.value = 'unavailable'
      return Promise.resolve()
    }
    if (pending)
      return pending
    const ticket = generation
    const key = accountKey.value
    const current = () => !disposed && ticket === generation && key === accountKey.value
    status.value = 'loading'
    pending = assetsApi.summary().then((result) => {
      if (current()) {
        data.value = result
        status.value = 'ready'
      }
    }).catch(() => {
      if (current())
        status.value = 'error'
    }).finally(() => {
      if (current())
        pending = null
    })
    return pending
  }

  watch(accountKey, () => {
    generation++
    pending = null
    data.value = null
    status.value = 'idle'
    if (accountKey.value)
      void refresh()
  }, { immediate: true, flush: 'sync' })

  if (getCurrentScope()) {
    onScopeDispose(() => {
      disposed = true
      generation++
    })
  }

  return {
    status,
    couponCount: computed(() => data.value?.couponCount ?? null),
    balance: computed(() => data.value ? (data.value.balanceCents / 100).toFixed(2) : null),
    score: computed(() => data.value?.points ?? null),
    refresh,
  }
}
