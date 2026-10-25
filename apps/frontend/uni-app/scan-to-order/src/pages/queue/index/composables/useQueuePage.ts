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
  const recordsFailed = ref(false)
  const session = useSession()
  const canViewRecords = computed(() => session.hasLogin && session.identity === 'customer')
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
    recordsFailed.value = false
    list.value = []
    mylist.value = []
    try {
      session.updateNowTime()
      const results = await Promise.allSettled([queueApi.types(), session.hasLogin && session.identity === 'customer' ? queueApi.myRecords() : Promise.resolve([])])
      if (request !== revision || identity !== session.sessionRevision)
        return
      failed.value = results[0].status === 'rejected'
      recordsFailed.value = results[1].status === 'rejected'
      if (results[0].status === 'fulfilled')
        list.value = results[0].value
      if (results[1].status === 'fulfilled')
        mylist.value = results[1].value.map(toMyQueueView)
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
    if (taking.value || loading.value || (action === 'take' && (failed.value || recordsFailed.value)) || !requireIdentity('customer'))
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
  return { list, mylist, recordsFailed, canViewRecords, taking, loading, failed, active, refresh, queuingGet, cancel: (id: number) => perform('cancel', id) }
}
