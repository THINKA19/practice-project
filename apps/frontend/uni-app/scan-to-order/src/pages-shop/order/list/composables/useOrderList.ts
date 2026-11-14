/**
 * ============================================================================
 * 门店订单列表编排
 * ============================================================================
 *
 * 【文件概述】
 * 管理订单范围、历史日期、搜索与前台刷新，数据沿用订单领域 store。
 *
 * 【方法与导出清单】
 * - useOrderList(access)：返回当前页面筛选项及可见订单。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useOrderList } from './composables/useOrderList'
 * import { useMerchantPage } from '@/pages-shop/auth/permissions'
 * const { list, refresh } = useOrderList(useMerchantPage())
 * ```
 * ============================================================================
 */
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { merchantClock, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import type { MerchantPageAccess } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeStore } from '@/pages-shop/shop/index'
import { useMerchantOrderStore } from '../store'
import { matchesCategory, orderCategories, orderFilters, orderPendingFilters, parseOrderListQuery } from '../models/filters'
import type { OrderCategory } from '../models/filters'

/**
 * 组合授权范围内的待处理、历史及工作台今日订单。
 * @param access 商家页面准入状态，页面隐藏时失效。
 * @returns 列表、搜索和日期筛选状态，以及手动重试方法。
 * @example useOrderList(useMerchantPage()).list // => 当前已授权范围的响应式订单列表
 */
export function useOrderList(access: MerchantPageAccess) {
  const store = useMerchantOrderStore()
  const context = useMerchantShopStore()
  const notices = useMerchantNoticeStore()
  const { orders, error, loading: refreshing } = storeToRefs(store)
  const loading = computed(() => context.loading || refreshing.value)
  const isOwner = computed(() => context.current?.roleTemplate === 'owner')
  const category = ref<OrderCategory>()
  const metric = ref<'today' | 'pending'>()
  const activeTab = ref('all')
  const pendingBooking = ref(false)
  const keyword = ref('')
  const rangeIndex = ref(0)
  const fromDay = ref('')
  const toDay = ref('')
  const now = ref(new Date())
  const clock = computed(() => merchantClock(context.current))
  const today = computed(() => clock.value(now.value).day)
  const tabs = computed(() => orderFilters(category.value, isOwner.value))
  const selected = computed(() => orderCategories.find(item => item.key === category.value))
  const dateEnabled = computed(() => isOwner.value && !!category.value && category.value !== 'booking')
  const cashierAllowed = computed(() => isOwner.value && context.can('order.amount.read'))

  const scopedOrders = computed(() => {
    const query = keyword.value.trim().replace(/^#/, '').toUpperCase()
    const last7Days = clock.value(new Date(now.value.getTime() - 6 * 86400000)).day
    return orders.value.filter((order) => {
      if (!matchesCategory(order, category.value) || (category.value === 'cashier' && !cashierAllowed.value))
        return false
      if (metric.value === 'pending' && !orderPendingFilters.awaitingAcceptance.matches(order))
        return false
      if (metric.value === 'today' || (dateEnabled.value && rangeIndex.value !== 0)) {
        const date = new Date(order.createdAt)
        if (!Number.isFinite(date.getTime()))
          return false
        const day = clock.value(date).day
        const custom = dateEnabled.value && rangeIndex.value === 3
        const first = custom ? fromDay.value : dateEnabled.value && rangeIndex.value === 2 ? last7Days : today.value
        const last = custom ? toDay.value : today.value
        if (day < first || day > last)
          return false
      }
      const reference = category.value === 'cashier' ? order.cashier?.number : order.type === '堂食' ? order.tableNo : order.pickupNumber
      return !query || reference?.trim().replace(/^#/, '').toUpperCase() === query
        || order.id.toUpperCase().endsWith(query)
    })
  })
  const list = computed(() => {
    const filter = tabs.value.find(item => item.key === activeTab.value)
    return scopedOrders.value
      .filter(order => !filter || filter.matches(order))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  })

  onLoad((query) => {
    const target = parseOrderListQuery(query)
    category.value = target.category
    metric.value = target.metric
    const pending = query?.pending
    pendingBooking.value = target.category === 'booking' && pending === 'awaitingConfirmation'
    const filter = Object.entries(orderPendingFilters).find(([status]) => status === pending)?.[1]
    if (target.category && filter && tabs.value.includes(filter))
      activeTab.value = filter.key
  })

  watch(tabs, (options) => {
    if (!options.some(item => item.key === activeTab.value))
      activeTab.value = 'all'
  })
  let inFlight: Promise<void> | undefined
  let syncPending = false
  /**
   * 基于当前准入刷新一次，并合并查询期间收到的变更。
   * @param 无参数。
   * @returns 查询结束后完成的 Promise，错误由 store 保存。
   * @example await refresh() // => 当前可见订单重新加载
   */
  async function refresh() {
    if (!access.granted.value || category.value === 'booking' || (!category.value && !metric.value))
      return
    if (inFlight) {
      syncPending = true
      return inFlight
    }
    now.value = new Date()
    const request = store.refresh()
    inFlight = request
    try {
      await request
    }
    finally {
      inFlight = undefined
      if (syncPending) {
        syncPending = false
        await refresh()
      }
    }
  }

  watch(access.granted, (granted) => {
    if (!granted) {
      syncPending = false
      return
    }
    void refresh()
  })
  watch(() => notices.orderChangeVersion, () => {
    if (!access.granted.value)
      return
    void refresh()
  })
  return {
    activeTab,
    pendingBooking,
    list,
    error,
    loading,
    tabs,
    selected,
    metric,
    dateEnabled,
    cashierAllowed,
    keyword,
    rangeIndex,
    fromDay,
    toDay,
    today,
    refresh,
    findOrder: (id: string) => orders.value.find(order => order.id === id),
  }
}
