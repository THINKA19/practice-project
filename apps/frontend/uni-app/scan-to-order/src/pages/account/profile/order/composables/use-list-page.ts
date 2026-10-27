import type { Order, OrderFilter, OrderGoods } from '../models/types'
import { computed, ref } from 'vue'
import { getIdentity, getToken, requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { canApplyRefund, canCallShop, canCancel, canDeleteInList, canPay, filterOrders } from '../domain/order.rules'
import { orderApi } from './use-requests'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { confirm, showError, toast } from '@/utils/project/interaction'

import { useOrderPay } from './use-pay'
import { ORDER_TABS } from '../models/enums'

import type { OrderCardVM } from '../components/OrderCard/types'

/** 维护顾客订单列表、筛选和操作锁；所有敏感动作绑定当前会话，数据请求按代次隔离。 */
export function useOrderListPage() {
  const apiOk = ref(false)

  const loading = ref(false)

  const failed = ref(false)

  const activeTab = ref<OrderFilter>('all')

  const orderList = ref<Order[] | null>(null)

  const goodsMap = ref<Record<string, OrderGoods[]>>({})

  const actionPending = ref(false)

  const needsLogin = ref(false)
  let generation = 0

  const scope = useSessionAccountScope(() => {
    generation++

    orderList.value = null

    goodsMap.value = {}

    apiOk.value = false

    loading.value = false

    actionPending.value = false
  })

  const cards = computed<OrderCardVM[]>(() => filterOrders(orderList.value || [], activeTab.value).map(order => ({
    order,
    goods: goodsMap.value[String(order.id)] || [],
    typeText: ORDER_TABS.find(tab => tab.key === order.orderType)?.label || '',
    statusText: order.statusStr || ({ '-1': '已取消', '0': '待付款', '1': '待取餐/配送', '2': '配送中', '3': '待评价', '4': '已完成' }[order.status] || ''),
    statusClass: order.status === 0 ? 'status-pending' : order.status === -1 ? 'status-cancel' : 'status-success',
    showCallShop: canCallShop(order),
    showDelete: canDeleteInList(order),
    showCancel: canCancel(order),
    showRefund: canApplyRefund(order),
    showPay: canPay(order),
  })))

  async function refresh() {
    needsLogin.value = !(getToken() && getIdentity() === 'customer')
    if (needsLogin.value)
      return

    const ticket = scope.ticket()

    const request = ++generation

    loading.value = true

    failed.value = false

    try {
      const result = await orderApi.list({})

      if (!scope.current(ticket) || request !== generation)
        return

      if (!Array.isArray(result.orderList) || !result.goodsMap || typeof result.goodsMap !== 'object' || Object.values(result.goodsMap).some(value => !Array.isArray(value)))
        throw new Error('订单列表数据无效')
      orderList.value = result.orderList.length ? result.orderList : null

      goodsMap.value = result.goodsMap || {}
    }
    catch {
      if (scope.current(ticket) && request === generation)
        failed.value = true
    }
    finally {
      if (scope.current(ticket) && request === generation) {
        loading.value = false

        apiOk.value = true
      }
    }
  }

  const pay = useOrderPay(refresh, () => actionPending.value)

  async function changeOrder(id: number, remove: boolean) {
    if (actionPending.value || pay.paying.value || !requireIdentity('customer'))
      return

    const order = orderList.value?.find(item => item.id === id)

    if (!order || !(remove ? canDeleteInList(order) : canCancel(order)))
      return

    const ticket = scope.ticket()

    actionPending.value = true

    try {
      if (!await confirm({ content: remove ? '确认删除这条订单记录吗？删除记录不会取消订单，也不会发起退款。' : '确认取消该订单吗？' }) || !scope.current(ticket))
        return

      await (remove ? orderApi.remove(id) : orderApi.close(id))

      if (scope.current(ticket))
        await refresh()
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
    finally {
      if (scope.current(ticket))
        actionPending.value = false
    }
  }

  async function refundApply(id: number) {
    const order = orderList.value?.find(item => item.id === id)
    if (!order || !canApplyRefund(order) || actionPending.value || pay.paying.value || !requireIdentity('customer'))
      return
    return navigate(ClientRoutes.Account.refundApply, { id })
  }

  function goBack() {
    if (getCurrentPages().length > 1)
      uni.navigateBack({ fail: () => { void navigate(ClientRoutes.Account.my) } })
    else
      void navigate(ClientRoutes.Account.my)
  }

  async function callShop(shopId?: number, demo = false) {
    if (demo) {
      uni.showModal({ title: '演示门店', content: '当前为 Mock 订单，未配置真实商家电话。正式订单会获取商家电话并发起拨号。', showCancel: false })
      return
    }
    if (!shopId)
      return toast('暂无商家联系电话')

    const ticket = scope.ticket()

    try {
      const phone = await orderApi.shopPhone(shopId)

      if (scope.current(ticket) && phone)
        uni.makePhoneCall({ phoneNumber: phone, fail: showError })
      else if (scope.current(ticket))
        toast('暂无商家联系电话')
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
  }

  return { actionPending, needsLogin, login: () => requireIdentity('customer'), apiOk, loading, failed, orderList, cards, activeTab, tabs: ORDER_TABS, goBack, init: () => uni.setNavigationBarTitle({ title: '我的订单' }), refresh, toIndexPage: () => navigate(ClientRoutes.Ordering.order), toDetail: (id: number) => navigate(ClientRoutes.Account.orderDetail, { id }), cancelOrder: (id: number) => changeOrder(id, false), deleteOrder: (id: number) => changeOrder(id, true), callShop, refundApply, ...pay }
}
