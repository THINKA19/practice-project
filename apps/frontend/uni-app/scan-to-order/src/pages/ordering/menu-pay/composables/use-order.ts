import { useOrderingCurrency } from '@/pages/ordering/index'
/**
 * ============================================================================
 * 【文件概述】ordering 的订单支付编排：复用账户、订单和唯一会话公开接口；不维护第二份凭证。
 * 【方法与导出清单】usePayOrder：校验金额、确认余额支付或打开平台收银台。
 * 【综合使用示例】import { usePayOrder } from './use-order'; const payment = usePayOrder(); await payment.settle(order)
 * ============================================================================
 */
import { ref } from 'vue'
import type { NextAction } from '../models/payment.types'
import { assetApi } from '@/pages/account/assets/asset'
import { orderApi } from '@/pages/account/profile/order'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { confirm } from '@/utils/project/interaction'
import { planOrderPayment } from '../domain/payment.rules'

/** 创建页面独立支付流程。无参数。@returns 收银台状态及 settle/close 命令；关闭、换账号或离页后旧响应失效。@example usePayOrder().close() // 清空收银台 */
export function usePayOrder() {
  const { formatPrice } = useOrderingCurrency()
  const show = ref(false)
  const money = ref(0)
  const orderId = ref<number | string>('')
  const nextAction = ref<NextAction>()
  const settling = ref(false)
  let operation = 0

  /** 清理本次收银台并使未完成请求失效。无参数。@returns void。@example close() */
  function close() {
    operation++
    show.value = false
    money.value = 0
    orderId.value = ''
    nextAction.value = undefined
    settling.value = false
  }
  const scope = useSessionAccountScope(close)

  /**
   * 根据可信订单金额启动支付；错误原样交给页面展示。
   * @param order 服务端确认的订单 ID、金额（元）及积分。
   * @returns 支付阶段；取消、重复调用、会话变化均不继续扣款。
   * @example await settle({ id: 1, amountReal: 28 }) // 取决于余额与用户确认结果
   */
  async function settle(order: { id: number, amountReal: number, score?: number }) {
    if (settling.value)
      return { kind: 'busy' as const }
    if (!requireIdentity('customer'))
      return { kind: 'cancelled' as const }
    if (!Number.isSafeInteger(order.id) || order.id <= 0 || !Number.isFinite(order.amountReal) || order.amountReal < 0 || !Number.isSafeInteger(Math.round(order.amountReal * 100)) || !Number.isFinite(order.score ?? 0) || (order.score ?? 0) < 0)
      throw new Error('订单金额或积分无效')
    const ticket = scope.ticket()
    const started = ++operation
    const current = () => started === operation && scope.current(ticket)
    settling.value = true
    try {
      const amount = await assetApi.amount()
      if (!current())
        return { kind: 'obsolete' as const }
      if (!Number.isFinite(amount.balance) || amount.balance < 0 || !Number.isFinite(amount.score) || amount.score < 0)
        throw new Error('账户余额或积分数据无效')
      const plan = planOrderPayment(order.amountReal, order.score ?? 0, amount)
      if (!plan.ok)
        throw new Error('积分不足，暂不能支付')
      if (plan.remain > 0) {
        orderId.value = order.id
        money.value = plan.remain
        nextAction.value = { type: 0, id: order.id }
        show.value = true
        return { kind: 'panelOpened' as const }
      }
      const accepted = await confirm({ content: `使用余额支付 ${formatPrice(order.amountReal)}？` })
      if (!current())
        return { kind: 'obsolete' as const }
      if (!accepted)
        return { kind: 'cancelled' as const }
      await orderApi.payByBalance(order.id)
      return { kind: current() ? 'paid' as const : 'obsolete' as const }
    }
    finally {
      if (current())
        settling.value = false
    }
  }
  return { show, money, orderId, nextAction, settling, close, settle }
}
