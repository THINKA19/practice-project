import type { RiderOrder } from '../type'
import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RIDER_MAX_CONCURRENT } from '@/constants/rider'
import { useRiderOrderPoolStore } from '@/store/riderOrderPool'
import { useRiderSessionStore } from '@/store/riderSession'
import { useRiderAuth } from './useRiderAuth'

/** 今日收入目标（mock：按 20 单满勤估算） */
const DAILY_INCOME_TARGET = 120

/**
 * 骑手工作台：上下线 / 接单大厅 / 在途订单流转 / 今日产出
 */
export function useRiderWorkbench() {
  // 状态与派生数据必须经 storeToRefs 解构，直接解构会丢掉响应式（页面不再跟随更新）
  // 会话（只读 profile）与订单池（读写）是两个 store，按各自来源解构
  const { profile } = storeToRefs(useRiderSessionStore())
  const {
    online,
    hallOrders,
    activeOrders,
    doneOrders,
    stats,
    level,
  } = storeToRefs(useRiderOrderPoolStore())
  // 方法与业务动作直接取用，不需要响应式包装
  const {
    toggleOnline,
    grabOrder,
    pickupOrder,
    finishOrder,
    cancelAccept,
    callCustomer,
  } = useRiderOrderPoolStore()
  const { restoreProfile, ensureLogin, logout } = useRiderAuth()

  const progress = computed(() => Math.min(100, Math.round((stats.value.todayIncome / DAILY_INCOME_TARGET) * 100)))

  onLoad(() => {
    restoreProfile()
  })

  onShow(() => {
    // 进入工作台强制校验登录态（未登录直接跳登录页）
    ensureLogin()
  })

  /** 刷新大厅订单（mock：延迟后提示） */
  function refresh() {
    setTimeout(() => uni.showToast({ title: '已刷新大厅订单', icon: 'none' }), 600)
  }

  /** 下拉刷新 */
  onPullDownRefresh(() => {
    setTimeout(() => {
      uni.stopPullDownRefresh()
      uni.showToast({ title: '已刷新大厅订单', icon: 'none' })
    }, 600)
  })

  /** 抢单 */
  function onGrab(order: RiderOrder) {
    grabOrder(order)
  }

  /** 取餐 */
  function onPickup(order: RiderOrder) {
    pickupOrder(order)
  }

  /** 送达 */
  function onFinish(order: RiderOrder) {
    finishOrder(order)
  }

  /** 转单（回大厅） */
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

  return {
    profile,
    online,
    hallOrders,
    activeOrders,
    doneOrders,
    stats,
    level,
    progress,
    target: DAILY_INCOME_TARGET,
    maxConcurrent: RIDER_MAX_CONCURRENT,
    toggleOnline,
    refresh,
    onGrab,
    onPickup,
    onFinish,
    onCancel,
    callCustomer,
    logout,
  }
}
