import { describe, expect, it } from 'vitest'
import { planYouhuiPay } from '../domain/payment.rules'

describe('planYouhuiPay', () => {
  const rules = [
    { id: 1, consume: 50, discounts: 5 },
    { id: 2, consume: 100, discounts: 8 },
    { id: 3, consume: 200, discounts: 30 },
  ]

  it('取门槛最高且满足的规则', () => {
    const plan = planYouhuiPay(150, rules, 0)

    expect(plan.rule?.id).toBe(2)

    expect(plan.needPayAmount).toBe(142)

    expect(plan.wxpayAmount).toBe(142)
  })

  it('余额抵扣后仍需支付', () => {
    expect(planYouhuiPay(60.5, rules, 20.3).wxpayAmount).toBe(35.2)
  })

  it('余额足够时在线支付金额 <= 0', () => {
    expect(planYouhuiPay(30, rules, 100).wxpayAmount).toBeLessThanOrEqual(0)
  })
})
