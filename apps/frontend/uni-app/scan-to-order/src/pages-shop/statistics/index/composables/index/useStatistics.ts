import type { StatisticsReport } from '../../models/index'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import { merchantClock, merchantCurrency, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { statisticsApi } from '../../api/statistics'
import { offsetDay, periodEnd, periodStart, TOP_GOODS_LIMIT } from '../../models/index'

export function useStatistics() {
  const context = useMerchantShopStore()
  const activePeriod = ref(1)
  const report = ref<StatisticsReport>()
  const cumulative = ref<StatisticsReport>()
  const cumulativeFailed = ref(false)
  const loading = ref(true)
  const failed = ref(false)
  const currency = computed(() => merchantCurrency(context.current))
  const canReadAmounts = computed(() => context.can('order.amount.read'))
  const today = computed(() => {
    // Re-evaluate the shop date on each report refresh.
    void loading.value
    return merchantClock(context.current)(new Date()).day
  })
  const range = computed(() => report.value?.range ?? {
    start: periodStart(activePeriod.value, today.value),
    end: periodEnd(activePeriod.value, today.value),
  })
  const finance = computed(() => canReadAmounts.value ? report.value?.finance : undefined)
  const topGoods = computed(() => [...(report.value?.topGoods ?? [])]
    .sort((a, b) => b.sold - a.sold || a.rank - b.rank)
    .slice(0, TOP_GOODS_LIMIT))
  const trend = computed(() => {
    const result = report.value
    const { start, end } = range.value
    if (!canReadAmounts.value || !result || !start || (!result.trend.length && result.overview.revenue === undefined))
      return []

    const amounts = new Map(result.trend.map(point => [point.day, point.value]))
    const points = []
    for (let day = start; day <= end; day = offsetDay(day, 1))
      points.push({ day, value: amounts.get(day) ?? 0 })
    return points
  })
  let revision = 0
  let cumulativeRevision = 0

  watch(() => context.revision, () => {
    revision++
    cumulativeRevision++
    cumulative.value = undefined
    cumulativeFailed.value = false
    report.value = undefined
    loading.value = false
    failed.value = false
  }, { flush: 'sync' })

  async function refresh() {
    const started = ++revision
    loading.value = true
    failed.value = false
    try {
      const captured = context.capture('statistics.read')
      const result = await statisticsApi.overview(captured, activePeriod.value)
      if (started !== revision || !context.matches(captured))
        return

      report.value = result
    }
    catch {
      if (started === revision)
        failed.value = true
    }
    finally {
      if (started === revision)
        loading.value = false
    }
  }

  async function loadCumulative() {
    const started = ++cumulativeRevision
    cumulativeFailed.value = false
    try {
      const captured = context.capture('statistics.read')
      const result = await statisticsApi.overview(captured, 3)
      if (started === cumulativeRevision && context.matches(captured))
        cumulative.value = result
    }
    catch {
      if (started === cumulativeRevision) {
        cumulative.value = undefined
        cumulativeFailed.value = true
      }
    }
  }

  async function refreshAll() {
    await Promise.all([refresh(), loadCumulative()])
  }

  onShow(async () => {
    await context.refresh()
    await refreshAll()
  })
  watch(activePeriod, () => {
    report.value = undefined
    void refresh()
  })

  return {
    activePeriod,
    currency,
    report,
    cumulative,
    cumulativeFailed,
    loading,
    failed,
    canReadAmounts,
    range,
    finance,
    today,
    topGoods,
    trend,
    refresh: refreshAll,
  }
}
