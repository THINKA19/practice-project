/** 买单金额校验、确认和模拟提交；不使用固定余额、不扣真实资金。 */
import { onScopeDispose, ref, watch } from 'vue'
import { redirectToLogin, useSessionState } from '@/pages/auth/session'
import { toast } from '@/utils/project/feedback'
import { billApi, isBillDemo } from './use-requests'
import { parseAmount, quoteBill } from '../domain/bill-pay.rules'
import type { PayBillDiscount } from '../models/types'

/**
 * 维护买单金额快照、幂等键与待确认状态；换号清空草稿，结果不明时只允许原单重试。
 * @param matchRule 按消费金额（元）匹配优惠规则。
 * @param ready 优惠配置是否已成功就绪。
 */
export function useBillPayPayment(matchRule: (amount: number) => PayBillDiscount | undefined, ready: () => boolean = () => true) {
  const session = useSessionState()
  const amount = ref('')
  const paymentShow = ref(false)
  const money = ref('0.00')
  const remark = ref('')
  const submitting = ref(false)
  let quoteCents = 0
  let payableCents = 0
  let requestId = ''
  let uncertain = false
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  watch(() => session.sessionRevision, () => {
    revision++
    amount.value = ''
    money.value = '0.00'
    remark.value = ''
    quoteCents = 0
    payableCents = 0
    paymentShow.value = false
    submitting.value = false
    requestId = ''
    uncertain = false
  }, { flush: 'sync' })
  function bindSave() {
    session.updateNowTime()
    if (disposed || submitting.value)
      return
    if (paymentShow.value)
      return
    if (!ready()) {
      toast('请等待优惠加载完成，失败时请先重试')
      return
    }
    if (!isBillDemo()) {
      toast('门店买单支付尚未开放')
      return
    }
    if (!session.hasLogin || session.identity !== 'customer') {
      redirectToLogin({ identity: 'customer' })
      return
    }
    const cents = parseAmount(amount.value)
    if (cents === null) {
      toast('请输入大于零且最多两位小数的消费金额')
      return
    }
    if (uncertain && cents !== quoteCents) {
      toast('上次买单结果未确认，请先使用原金额重试核对')
      return
    }
    const quote = quoteBill(cents, matchRule(cents / 100))
    if (quoteCents !== cents || !requestId)
      requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    quoteCents = cents
    payableCents = quote.payableCents
    money.value = (quote.payableCents / 100).toFixed(2)
    remark.value = `消费 ¥${(cents / 100).toFixed(2)}，优惠 ¥${(quote.discountCents / 100).toFixed(2)}（模拟，不扣款）`
    paymentShow.value = true
  }
  async function paymentOk() {
    session.updateNowTime()
    if (disposed || submitting.value || !paymentShow.value)
      return
    if (!session.hasLogin || session.identity !== 'customer') {
      paymentShow.value = false
      redirectToLogin({ identity: 'customer' })
      return
    }
    const request = revision
    submitting.value = true
    try {
      const result = await billApi.pay(quoteCents, requestId)
      if (request !== revision || disposed)
        return
      if (result.payableCents !== payableCents)
        throw new Error('买单金额发生变化，请核对结果')
      money.value = (result.payableCents / 100).toFixed(2)
      paymentShow.value = false
      amount.value = ''
      requestId = ''
      uncertain = false
      toast('模拟买单完成，未发生真实扣款')
    }
    catch {
      if (request === revision && !disposed) {
        uncertain = true
        toast('模拟买单结果未确认，请保留当前确认单重试')
      }
    }
    finally {
      if (request === revision && !disposed)
        submitting.value = false
    }
  }
  function paymentCancel() {
    if (!submitting.value)
      paymentShow.value = false
  }
  return { amount, paymentShow, money, remark, submitting, bindSave, paymentOk, paymentCancel }
}
