/**
 * ============================================================================
 * 门店订单列表缓存
 * ============================================================================
 *
 * 【文件概述】
 * 缓存当前门店订单，处理请求乱序和门店授权变化。
 *
 * 【方法与导出清单】
 * - useMerchantOrderStore：获取列表数据及其刷新方法。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useMerchantOrderStore } from './store'
 * const { refresh } = useMerchantOrderStore()
 * ```
 * ============================================================================
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ShopOrder } from '../models/index'
import { isFulfillmentOrder, withoutOrderAmounts } from '../models/fulfillment'
import { fetchShopOrders } from '../api/orders'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'

/**
 * 获取当前门店的订单列表缓存。
 * @param 无参数。
 * @returns 订单集合、读取状态和刷新方法。
 * @example useMerchantOrderStore().orders // => 当前可见的缓存订单
 */
export const useMerchantOrderStore = defineStore('merchant-orders', () => {
  const contextStore = useMerchantShopStore()
  const orders = ref<ShopOrder[]>([])
  const loading = ref(false)
  const error = ref('')
  let request = 0
  watch(() => contextStore.revision, () => {
    orders.value = []
    loading.value = false
    error.value = ''
    request++
  }, { flush: 'sync' })
  async function refresh() {
    const started = ++request
    loading.value = true
    try {
      const context = contextStore.capture('order.read')
      const result = await fetchShopOrders(context)
      if (started === request && contextStore.matches(context)) {
        const scoped = result.filter(order => order.shopId === context.shopId
          && (contextStore.current?.roleTemplate === 'owner' || isFulfillmentOrder(order)))
        orders.value = contextStore.can('order.amount.read') ? scoped : scoped.map(withoutOrderAmounts)
        error.value = ''
      }
    }
    catch (reason) {
      if (started === request)
        error.value = reason instanceof Error ? reason.message : '订单刷新失败'
    }
    finally {
      if (started === request)
        loading.value = false
    }
  }
  return { orders, loading, error, refresh }
})
