import { describe, expect, it } from 'vitest'
import { applyPayBillDiscount, parseAlipayQrcode, planOrderPayment } from '../domain/payment.rules'

describe('payment', () => {
  it('余额抵扣与积分校验', () => {
    expect(planOrderPayment(30, 0, { balance: 10, score: 0 }).remain).toBe(20)

    expect(planOrderPayment(30, 0, { balance: 50, score: 0 }).remain).toBe(0)

    expect(planOrderPayment(30, 5, { balance: 0, score: 1 }).ok).toBe(false)
  })

  it('优惠买单取最大优惠', () => {
    const rules = [{ id: 1, consume: 50, discounts: 5 }, { id: 2, consume: 100, discounts: 15 }]

    expect(applyPayBillDiscount(120, rules)).toEqual({ discount: 15, pay: 105 })

    expect(applyPayBillDiscount(20, rules)).toEqual({ discount: 0, pay: 20 })
  })

  it('解析支付宝二维码', () => {
    expect(parseAlipayQrcode(JSON.stringify({ alipay_trade_precreate_response: { qr_code: 'https://qr' } }))).toBe('https://qr')

    expect(parseAlipayQrcode('bad')).toBeNull()
  })
})
