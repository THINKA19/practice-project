import type { RiderOrder, RiderOrderTab } from '../type'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { RIDER_ORDER_STATUS } from '@/constants/status'
import { useTabFilter } from '@/hooks/useTabFilter'
import { useRiderOrderPoolStore } from '@/store/riderOrderPool'
import { useRiderAuth } from './useRiderAuth'

/** 订单列表 Tab（key 即过滤维度，命中规则见 useRiderOrders 的 match） */
export const RIDER_ORDER_TABS: RiderOrderTab[] = [
  { key: 'active', label: '进行中' },
  { key: 'done', label: '已完成' },
  { key: 'all', label: '全部' },
]

/**
 * 我的配送订单：Tab 过滤 + 订单流转操作
 */
export function useRiderOrders() {
  // 状态经 storeToRefs 解构保持响应式；方法直接取用
  const { orders } = storeToRefs(useRiderOrderPoolStore())
  const { pickupOrder, finishOrder, cancelAccept, callCustomer } = useRiderOrderPoolStore()
  const { restoreProfile, ensureLogin } = useRiderAuth()

  const { activeKey: activeTab, list, countByKey: badge } = useTabFilter<RiderOrder, RiderOrderTab['key']>({
    source: orders,
    tabs: RIDER_ORDER_TABS,
    allKey: 'all',
    // 与 store 的 activeOrders / doneOrders 同口径：进行中 = 待取餐 + 配送中
    //（大厅待接的 pending 不算「我的进行中」，但计入「全部」，与改造前一致）
    match: (order, key) =>
      key === 'done' ? order.status === 'done' : order.status === 'accepted' || order.status === 'delivering',
  })

  function statusMeta(order: RiderOrder) {
    return RIDER_ORDER_STATUS[order.status]
  }

  function onPickup(order: RiderOrder) {
    pickupOrder(order)
  }

  function onFinish(order: RiderOrder) {
    finishOrder(order)
  }

  function onCancel(order: RiderOrder) {
    uni.showModal({
      title: '转单',
      content: '确认将该订单转回接单大厅吗？',
      success: (res) => {
        if (res.confirm)
          cancelAccept(order)
      },
    })
  }

  onLoad(() => {
    restoreProfile()
    ensureLogin()
  })

  return {
    activeTab,
    list,
    badge,
    statusMeta,
    onPickup,
    onFinish,
    onCancel,
    callCustomer,
  }
}
