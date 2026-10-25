import type { MyQueueView, QueueType } from '../models/queue'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { queueApi } from '../api/queue'
import { toMyQueueView } from '../models/queue'
import { requireIdentity, useSession } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import { t } from '@/locale'

export function useQueuePage() {
  const list = ref<QueueType[]>([])
  const mylist = ref<MyQueueView[]>([])
  const taking = ref(false)
  const loading = ref(false)
  const failed = ref(false)
  const session = useSession()
  const active = computed(() => mylist.value.some(r => r.status === 0 || r.status === 1))
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  async function refresh() {
    if (disposed)
      return
    const request = ++revision
    const identity = session.sessionRevision
    loading.value = true
    failed.value = false
    list.value = []
    mylist.value = []
    try {
      session.updateNowTime()
      const results = await Promise.all([queueApi.types(), session.hasLogin && session.identity === 'customer' ? queueApi.myRecords() : Promise.resolve([])])
      if (request !== revision || identity !== session.sessionRevision)
        return
      list.value = results[0]
      mylist.value = results[1].map(toMyQueueView)
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
  watch(() => session.sessionRevision, () => {
    void refresh()
  })
  async function perform(action: 'take' | 'cancel', id: number) {
    if (taking.value || loading.value || failed.value || !requireIdentity('customer'))
      return
    const identity = session.sessionRevision
    taking.value = true
    try {
      if (action === 'take')
        await queueApi.take(id)
      else await queueApi.cancel(id)
      if (disposed || identity !== session.sessionRevision)
        return
      toast(t('common.submitSuccess'))
      await refresh()
    }
    catch { /* 请求层提示错误，不伪造成功。 */ }
    finally { taking.value = false }
  }
  function queuingGet(type: QueueType) {
    if (active.value || (type.status !== undefined && type.status !== 0))
      return
    return perform('take', type.id)
  }
  return { list, mylist, taking, loading, failed, active, refresh, queuingGet, cancel: (id: number) => perform('cancel', id) }
}
