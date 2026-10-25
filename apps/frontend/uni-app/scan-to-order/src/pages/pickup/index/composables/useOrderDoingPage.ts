import type { DoingOrderVM } from '../models/view'
import { computed } from 'vue'
import { usePickupOrders } from './usePickupOrders'

/** 保留页面装配接口，复用业务请求。 */
export function useOrderDoingPage() {
  const state = usePickupOrders()
  const items = computed<DoingOrderVM[]>(() => (state.orderList.value ?? []).map((order) => {
    const logistics = state.logisticsMap.value[String(order.id)]
    return { order, goods: state.goodsMap.value[String(order.id)] ?? [], logistics, address: logistics ? [logistics.provinceStr, logistics.cityStr, logistics.areaStr, logistics.address].join('') : '' }
  }))
  return { ...state, items }
}
