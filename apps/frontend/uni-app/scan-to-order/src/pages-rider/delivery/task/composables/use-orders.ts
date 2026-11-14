import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { RiderRoutes } from '@/pages-rider/routes'
import { navigate } from '@/utils/project/navigation'
import { deliveredAt, riderDateKey, summarizeDeliveryFees } from '../domain/task.rules'
import type { RiderOrder } from '../models/types'
import { useRiderTaskStore } from './use-store'
import { useRiderTaskRefresh } from './use-refresh'

const pageSize = 20
export const historyPeriods = ['today', 'week', 'month', 'all'] as const
type RecordView = 'all' | 'done' | 'cancelled'

export function historyTime(order: RiderOrder) {
  return order.status === 'done' ? deliveredAt(order) : order.cancelledAt
}

/** 从本人任务快照筛选终态记录，并对完整筛选结果汇总。 */
export function useRiderTaskOrders() {
  useRiderTaskRefresh()
  const store = useRiderTaskStore()
  const { myOrders, serviceArea, riderId, error, loading, clock } = storeToRefs(store)
  const today = computed(() => riderDateKey(clock.value, serviceArea.value?.timeZone))
  const period = ref<typeof historyPeriods[number]>('today')
  const recordView = ref<RecordView>('all')
  const orderQuery = ref('')
  const limit = ref(pageSize)

  watch([period, recordView, orderQuery], () => {
    limit.value = pageSize
  }, { flush: 'sync' })
  watch(riderId, () => {
    period.value = 'today'
    recordView.value = 'all'
    orderQuery.value = ''
    limit.value = pageSize
  })

  const filtered = computed(() => {
    let start = today.value
    if (period.value === 'week') {
      const date = new Date(today.value)
      date.setUTCDate(date.getUTCDate() - 6)
      start = date.toISOString().slice(0, 10)
    }
    else if (period.value === 'month') {
      start = `${today.value.slice(0, 7)}-01`
    }
    return myOrders.value.filter((task) => {
      if (task.status !== 'done' && task.status !== 'cancelled')
        return false
      if (period.value === 'all')
        return true
      const timestamp = historyTime(task)
      if (!timestamp || !Number.isFinite(Date.parse(timestamp)))
        return false
      const key = riderDateKey(timestamp, serviceArea.value?.timeZone)
      return key >= start && key <= today.value
    }).sort((a, b) => (Date.parse(historyTime(b) ?? '') || 0) - (Date.parse(historyTime(a) ?? '') || 0))
  })
  const delivered = computed(() => filtered.value.filter(task => task.status === 'done'))
  const summary = computed(() => summarizeDeliveryFees(delivered.value, serviceArea.value))
  const visible = computed(() => {
    const query = orderQuery.value.trim().replace(/^#/, '').toLowerCase()
    return filtered.value.filter(task =>
      (recordView.value === 'all' || task.status === recordView.value)
      && (!query || (task.orderId || task.id).toLowerCase().includes(query)),
    )
  })
  return {
    period,
    recordView,
    orderQuery,
    summary,
    cancelledCount: computed(() => filtered.value.filter(task => task.status === 'cancelled').length),
    currency: computed(() => serviceArea.value?.currency),
    list: computed(() => visible.value.slice(0, limit.value)),
    hasMore: computed(() => visible.value.length > limit.value),
    loadMore: () => {
      limit.value += pageSize
    },
    error,
    loading,
    refresh: store.refresh,
    viewDetail: (order: RiderOrder) => navigate(RiderRoutes.Delivery.taskDetail, { id: order.id }),
  }
}
