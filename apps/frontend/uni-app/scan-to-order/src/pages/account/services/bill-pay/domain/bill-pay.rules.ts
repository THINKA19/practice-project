import type { PayBillDiscount } from '../models/types'

/** 将正数消费金额字符串转换为整数分，最多保留两位小数；非法输入返回 null。 */
export function parseAmount(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{1,7}(?:\.\d{1,2})?$/.test(value.trim()))
    return null
  const cents = Math.round(Number(value.trim()) * 100)
  return cents > 0 && Number.isSafeInteger(cents) ? cents : null
}

/** 在达到消费门槛的有效规则中选择优惠金额最大的一项，金额单位为元。 */
export function matchDiscount(rules: PayBillDiscount[], amount: number) {
  return rules.filter(r => Number.isFinite(r.consume) && Number.isFinite(r.discounts) && r.consume >= 0 && r.discounts >= 0 && amount >= r.consume)
    .reduce<PayBillDiscount | undefined>((best, rule) => !best || rule.discounts > best.discounts ? rule : best, undefined)
}

/** 按整数分计算优惠与应付金额，优惠不超过消费额，不产生负应付金额。 */
export function quoteBill(cents: number, rule?: PayBillDiscount) {
  const discountCents = Math.min(cents, Math.max(0, Math.round((rule?.discounts ?? 0) * 100)))
  return { amountCents: cents, discountCents, payableCents: cents - discountCents }
}
