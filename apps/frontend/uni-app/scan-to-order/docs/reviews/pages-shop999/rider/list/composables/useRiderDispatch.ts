import type { Ref } from 'vue'
import type { DispatchOrder, Rider } from '../type'
import { computed, ref } from 'vue'
import { clonePlain } from '@/pages-shop/utils/clone'
import { formatHm } from '@/utils/date'
import { pendingData } from '@/mock/pending'
import { RIDER_MAX_LOAD } from '../type'

/**
 * 演示待派送订单 —— 接口未接入，非 mock 构建下按空数组渲染（见 src/mock/pending.ts）
 */
const DEMO_DISPATCH_ORDERS: DispatchOrder[] = pendingData('GET /shop/delivery/list?status=waiting', [
  {
    id: 'PS202609140001',
    type: '外卖',
    address: '幸福小区 3 栋 2 单元 501',
    customer: '张先生',
    phone: '138****8888',
    amount: 64,
    deliveryFee: 6,
    expectTime: '12:20 前送达',
    status: 'waiting',
  },
  {
    id: 'PS202609140002',
    type: '外卖',
    address: '创业大厦 A 座 1802',
    customer: '李女士',
    phone: '139****6666',
    amount: 88,
    deliveryFee: 8,
    expectTime: '12:35 前送达',
    status: 'waiting',
  },
  {
    id: 'PS202609140003',
    type: '自取',
    address: '门店自提（前台）',
    customer: '王先生',
    phone: '137****2222',
    amount: 32,
    deliveryFee: 0,
    expectTime: '12:10 前取餐',
    status: 'waiting',
  },
])

/**
 * 配送单派发：待派送池 → 指派骑手 → 撤回 / 标记送达
 *
 * 派单会同步骑手负载：load +1，负载 > 0 时骑手状态切为「配送中」。
 * TODO 上线时替换为：POST /shop/delivery/dispatch、/shop/delivery/withdraw
 */
export function useRiderDispatch(riders: Ref<Rider[]>) {
  // 深拷贝：派单 / 撤回 / 送达都是就地改写（status、riderId、assignedAt），
  // 浅拷贝会把模块级 DEMO_DISPATCH_ORDERS 一起改掉
  const orders = ref<DispatchOrder[]>(clonePlain(DEMO_DISPATCH_ORDERS))

  /** 待派送池 */
  const waitingOrders = computed(() => orders.value.filter(o => o.status === 'waiting'))
  /** 已派出的配送单 */
  const dispatchedOrders = computed(() => orders.value.filter(o => o.status !== 'waiting'))

  function findDispatchOrder(id: string) {
    return orders.value.find(o => o.id === id)
  }

  /** 派单：校验骑手是否可承接，成功后绑定骑手并抬高负载 */
  function dispatch(order: DispatchOrder, rider: Rider) {
    if (order.status !== 'waiting') {
      uni.showToast({ title: '该订单已派出', icon: 'none' })
      return false
    }

    // 双保险：UI 已过滤不可派单骑手，这里再兜一层，防止其它入口误派
    if (rider.status === 'offline' || rider.load >= RIDER_MAX_LOAD) {
      uni.showToast({ title: `${rider.name} 当前不可接单`, icon: 'none' })
      return false
    }

    order.status = 'assigned'
    order.riderId = rider.id
    order.riderName = rider.name
    order.assignedAt = formatHm()

    // 同步骑手负载与状态
    rider.load += 1
    if (rider.status === 'online')
      rider.status = 'busy'

    uni.showToast({ title: `已派给 ${rider.name}`, icon: 'success' })
    return true
  }

  /**
   * 撤回派单：订单回池，骑手减负载（负载为 0 且未下线则回到接单中）
   * 只允许撤回「配送中」的单：已送达的单再撤会重复减负载，把骑手负载算错。
   */
  function withdraw(order: DispatchOrder) {
    if (order.status !== 'assigned') {
      uni.showToast({ title: '该订单已送达，不能撤回', icon: 'none' })
      return
    }

    const rider = riders.value.find(r => r.id === order.riderId)
    if (rider) {
      rider.load = Math.max(0, rider.load - 1)
      if (rider.load === 0 && rider.status === 'busy')
        rider.status = 'online'
    }

    order.status = 'waiting'
    order.riderId = undefined
    order.riderName = undefined
    order.assignedAt = undefined
    uni.showToast({ title: '已撤回派单', icon: 'none' })
  }

  /** 标记送达（mock：真实链路由骑手端上报） */
  function markDelivered(order: DispatchOrder) {
    // 重复触发会让骑手今日单量与收入被重复计入
    if (order.status !== 'assigned') {
      uni.showToast({ title: '该订单已送达', icon: 'none' })
      return
    }

    const rider = riders.value.find(r => r.id === order.riderId)
    if (rider) {
      rider.load = Math.max(0, rider.load - 1)
      rider.todayOrders += 1
      rider.todayIncome += order.deliveryFee
      if (rider.load === 0 && rider.status === 'busy')
        rider.status = 'online'
    }

    order.status = 'done'
    uni.showToast({ title: '已标记送达', icon: 'success' })
  }

  return {
    orders,
    waitingOrders,
    dispatchedOrders,
    findDispatchOrder,
    dispatch,
    withdraw,
    markDelivered,
  }
}

