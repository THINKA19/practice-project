import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { fetchOrderCenterSummary } from './api/summary'
import type { OrderCenterSummary } from './models/summary'

/** Shares the authorized shop's pending work across the workspace and order center. */
export const useOrderCenterStore = defineStore('shop-order-center', () => {
  const context = useMerchantShopStore()
  const items = ref<OrderCenterSummary[]>([])
  const failed = ref(false)
  const ready = ref(false)
  const total = computed(() => items.value.reduce((sum, item) => sum + item.count, 0))
  let request = 0

  watch(() => context.revision, () => {
    request++
    items.value = []
    ready.value = false
    failed.value = false
  }, { flush: 'sync' })

  async function refresh() {
    if (context.loading || !context.can('order.read'))
      return
    const started = ++request
    const snapshot = context.capture('order.read')
    try {
      const result = await fetchOrderCenterSummary(snapshot)
      if (started !== request || !context.matches(snapshot))
        return
      items.value = result.filter(({ category }) => {
        if (category === 'booking')
          return context.can('booking.read')
        if (category === 'cashier')
          return context.current?.roleTemplate === 'owner' && context.can('order.amount.read')
        return true
      })
      failed.value = false
      ready.value = true
    }
    catch {
      if (started === request && context.matches(snapshot)) {
        items.value = []
        ready.value = false
        failed.value = true
      }
    }
  }

  return { items, failed, ready, total, refresh }
})
