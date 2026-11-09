/** 普通点餐直接提交现金结算订单，不调用余额或第三方支付。 */
import { ref } from 'vue'
import type { Ref } from 'vue'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import type { DeliveryVm } from './use-delivery'
import type { DiningTimeVm } from './use-dining-time'
import type { OrderPreviewVm } from './use-order-preview'
import { useCartStore } from '@/pages/ordering/menu-cart'
import { orderApi } from '@/pages/account/profile/order'
import { useShopCheckoutAvailability } from '@/pages/ordering/index'
import { redirect } from '@/pages/ordering/menu'
import { toast } from '@/utils/project/interaction'
import { ClientRoutes } from '@/pages/routes'

export interface SubmitOrderDeps {
  t: (key: string) => string
  delivery: Pick<DeliveryVm, 'peisongType' | 'isOutOfRange'>
  diningTime: Pick<DiningTimeVm, 'diningTime' | 'enabled'>
  preview: Pick<OrderPreviewVm, 'buildPayload' | 'status' | 'amountReal'>
  mobile: Ref<string>
  orderType: Ref<string>
  onError: (e: unknown) => void
}

/** 校验、幂等创建和跳转；不弹二次确认，不发起线上支付，失败保留购物车。 */
export function usePaySubmitOrder(deps: SubmitOrderDeps) {
  const { t, delivery, diningTime, preview, orderType } = deps
  const cart = useCartStore()
  const availability = useShopCheckoutAvailability()
  const submitLoading = ref(false)
  let submittedOrder: { id: number, amountReal: number } | null = null
  let requestSignature = ''
  let requestId = ''
  let cartCleared = false
  const scope = useSessionAccountScope(() => {
    submittedOrder = null
    requestSignature = ''
    requestId = ''
    cartCleared = false
    submitLoading.value = false
  })

  async function finish(ticket: number) {
    if (!cartCleared && orderType.value !== 'buyNow') {
      try {
        await cart.clear()
        if (!scope.current(ticket))
          return
        cartCleared = true
      }
      catch {
        if (scope.current(ticket))
          toast('订单已提交，购物车同步失败，请在订单页查看')
      }
    }
    if (scope.current(ticket)) {
      redirect(ClientRoutes.Account.orderDetail, { id: submittedOrder!.id, submitted: '1' })
    }
  }

  async function goCreateOrder() {
    if (submitLoading.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    submitLoading.value = true
    try {
      // 已收到成功响应后只继续清理和跳转，不因表单变化创建第二单。
      if (submittedOrder) {
        await finish(ticket)
        return
      }
      if (preview.status.value !== 'ready') {
        toast('请先确认订单金额后再提交')
        return
      }
      if (!diningTime.diningTime.value && diningTime.enabled.value) {
        toast(t('pay.select'))
        return
      }
      if (delivery.isOutOfRange()) {
        toast(t('pay.address'))
        return
      }
      const payload = await preview.buildPayload(true)
      if (!scope.current(ticket) || !payload || preview.status.value !== 'ready')
        return
      const signature = JSON.stringify(payload)
      const quotedAmount = preview.amountReal.value
      if (!requestId || signature !== requestSignature) {
        requestSignature = signature
        requestId = `ordering-${Date.now()}-${Math.random().toString(36).slice(2)}`
      }
      await availability.ensureAvailable(Number(payload.shopIdZt))
      if (!scope.current(ticket))
        return
      const latest = await preview.buildPayload(true)
      if (!scope.current(ticket))
        return
      if (preview.status.value !== 'ready' || preview.amountReal.value !== quotedAmount || !latest || JSON.stringify(latest) !== signature) {
        toast('订单信息已变更，请重新提交')
        return
      }
      const result = await orderApi.create({ ...payload, requestId })
      if (!scope.current(ticket))
        return
      if (!Number.isSafeInteger(result.id) || result.id <= 0 || !Number.isFinite(result.amountReal) || result.amountReal < 0)
        throw new Error('下单响应无效，请查询订单后再重试')
      submittedOrder = result
      await finish(ticket)
    }
    catch (e) {
      if (scope.current(ticket))
        deps.onError(e)
    }
    finally {
      if (scope.current(ticket))
        submitLoading.value = false
    }
  }
  return { submitLoading, checkoutReason: availability.reason, goCreateOrder }
}
