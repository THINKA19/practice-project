import { computed } from 'vue'
import { useBillPayPayment } from './use-payment'
import { useBillPayDiscounts } from './use-discounts'
import { parseAmount } from '../domain/bill-pay.rules'
import type { PayBillDiscount } from '../models/types'
import { isBillDemo } from './use-requests'
import { toast } from '@/utils/project/feedback'

/** Compose the page's child capabilities without putting orchestration in the view. */
export function useBillPayPage() {
  const demo = isBillDemo()

  // 装配买单模块：优惠规则 / 支付流程
  const { rechargeSendRules, matchRule, loadDiscounts, loading, failed, loaded } = useBillPayDiscounts()
  const { amount, paymentShow, money, remark, submitting, bindSave, paymentOk, paymentCancel } = useBillPayPayment(matchRule, () => loaded.value && !loading.value && !failed.value)

  const appliedRule = computed(() => {
    const cents = parseAmount(amount.value)
    return cents === null ? undefined : matchRule(cents / 100)
  })
  function ruleStatus(item: PayBillDiscount) {
    const cents = parseAmount(amount.value)
    if (cents === null)
      return '输入金额后自动匹配'
    if (cents < Math.round(item.consume * 100))
      return `还差 ¥${((Math.round(item.consume * 100) - cents) / 100).toFixed(2)}`
    return appliedRule.value?.id === item.id ? '已自动使用' : '可用，已优先使用最大优惠'
  }
  function explainRule(item: PayBillDiscount) {
    toast(`满 ¥${item.consume} 减 ¥${item.discounts}；${ruleStatus(item)}`)
  }

  return { demo, rechargeSendRules, loading, failed, loaded, amount, paymentShow, money, remark, submitting, bindSave, paymentOk, paymentCancel, appliedRule, ruleStatus, explainRule, loadDiscounts }
}
