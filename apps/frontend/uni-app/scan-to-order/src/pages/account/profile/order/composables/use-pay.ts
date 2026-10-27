import type { Order } from '../models/types'
import { ref } from 'vue'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { assetApi } from '@/pages/account/assets/asset'
import { orderApi } from './use-requests'
import { confirm, showError, toast } from '@/utils/project/interaction'

/** 当前只接真实余额支付；外部收银台未接入时明确提示，不模拟支付成功。 */
export function useOrderPay(refresh: () => Promise<void>, blocked: () => boolean = () => false) {
  const paying = ref(false)

  const scope = useSessionAccountScope(() => {
    paying.value = false
  })

  async function toPay(order: Pick<Order, 'id' | 'status' | 'amountReal' | 'score'>) {
    if (blocked() || paying.value || order.status !== 0 || !requireIdentity('customer'))
      return

    const ticket = scope.ticket()

    paying.value = true

    try {
      if (!Number.isFinite(order.amountReal) || order.amountReal < 0 || !Number.isSafeInteger(Math.round(order.amountReal * 100)))
        throw new Error('订单金额无效')
      const asset = await assetApi.amount()

      if (!scope.current(ticket))
        return

      if (!asset || !Number.isFinite(asset.balance) || asset.balance < 0 || !Number.isFinite(asset.score) || asset.score < 0 || !Number.isFinite(Number(order.score ?? 0)) || Number(order.score ?? 0) < 0)
        throw new Error('账户余额或积分数据无效，请刷新后重试')

      if (asset.score < Number(order.score || 0))
        return toast('积分不足')

      if (Math.round(asset.balance * 100) < Math.round(order.amountReal * 100))
        return toast('余额不足，在线收银台暂未开放')

      if (!await confirm({ content: `使用余额支付 ¥${order.amountReal}？` }) || !scope.current(ticket))
        return

      await orderApi.payByBalance(order.id)

      if (scope.current(ticket)) {
        toast('支付请求已受理，请以订单最新状态为准')

        await refresh()
      }
    }
    catch (error) {
      if (scope.current(ticket))
        showError(error)
    }
    finally {
      if (scope.current(ticket))
        paying.value = false
    }
  }

  return { paying, toPay }
}
