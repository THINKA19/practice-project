import { computed, nextTick, ref } from 'vue'
import type { OrderDetail } from '../models/types'
import { orderApi } from './use-requests'
import { getIdentity, getToken, requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { isCashOrder } from '../domain/order.rules'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

/** Detail page state; the route component only binds parameters and lifecycle. */
export function useOrderDetailPage() {
  const detail = ref<OrderDetail | null>(null)
  const loading = ref(true)
  const failed = ref(false)
  const needsLogin = ref(false)
  const submitted = ref(false)
  let loginRequested = false
  let id = ''
  let generation = 0
  let noticeShown = false
  let visible = true
  const scope = useSessionAccountScope(() => {
    generation++

    detail.value = null
    submitted.value = false
    noticeShown = false

    loading.value = false
  })
  const cashOrder = computed(() => !!detail.value && isCashOrder({ ...detail.value.orderInfo, extJson: detail.value.extJson ?? detail.value.orderInfo.extJson }))
  const submissionResult = computed(() => submitted.value && String(detail.value?.orderInfo.id) === id && Number(detail.value?.orderInfo.status) >= 0)
  async function load() {
    visible = true
    needsLogin.value = !(getToken() && getIdentity() === 'customer')
    if (needsLogin.value) {
      loading.value = false
      if (!loginRequested) {
        loginRequested = true
        requireIdentity('customer')
      }
      return
    }
    loginRequested = false

    const ticket = scope.ticket()

    const request = ++generation

    loading.value = true

    failed.value = false

    try {
      if (!id)
        throw new Error('缺少订单编号')

      const result = await orderApi.detail(id)

      if (!result?.orderInfo || !Array.isArray(result.goods))
        throw new Error('订单详情数据无效')
      if (result.orderInfo.id !== undefined && String(result.orderInfo.id) !== id)
        throw new Error('订单详情与请求不符')
      if (scope.current(ticket) && request === generation)
        detail.value = result
    }
    catch {
      if (scope.current(ticket) && request === generation)
        failed.value = true
    }
    finally {
      if (scope.current(ticket) && request === generation)
        loading.value = false
    }
    if (!scope.current(ticket) || request !== generation || failed.value || !submissionResult.value || noticeShown || !visible)
      return
    // 等详情内容呈现后提示，不在提交页跳转前开始计时。
    await nextTick()
    if (!scope.current(ticket) || request !== generation || noticeShown || !visible)
      return
    noticeShown = true
    uni.showToast({ title: cashOrder.value ? '下单成功，无需线上支付' : '下单成功', icon: 'none', duration: 2500 })
  }

  function init(query?: { id?: unknown, submitted?: unknown }) {
    noticeShown = false
    id = String(query?.id || '')
    submitted.value = query?.submitted === '1'
  }
  function login() {
    requireIdentity('customer')
  }
  const nextStep = computed(() => {
    const order = detail.value?.orderInfo
    if (!order || order.status < 0 || order.status >= 3)
      return ''
    if (order.orderType === 'delivery')
      return `请保持电话畅通，配送进度以订单状态为准。${cashOrder.value ? '收货时现金结算。' : ''}`
    if (order.orderType === 'pickup')
      return `请关注门店接单状态，再按门店通知到店取餐。${cashOrder.value ? '到店现金结算。' : ''}`
    return '请关注订单状态及门店后续通知。'
  })
  const amountLabel = computed(() => {
    const order = detail.value?.orderInfo
    if (order?.status === 0)
      return '应付金额'
    return order?.status === -1 || (cashOrder.value && order?.isPay !== true) ? '订单金额' : '实付金额'
  })
  function viewOrders() {
    void navigate(ClientRoutes.Account.allOrders)
  }
  function suspend() {
    visible = false
  }
  return { detail, loading, failed, needsLogin, submissionResult, cashOrder, nextStep, amountLabel, viewOrders, suspend, init, load, login }
}
