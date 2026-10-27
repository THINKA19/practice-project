import { expect, it } from 'vitest'
import { matchDiscount, parseAmount, quoteBill } from '../domain/bill-pay.rules'

it('拒绝非法和非正金额，按分保留两位小数', () => {
  for (const value of ['', '0', '-1', 'abc', 'NaN', 'Infinity', '1e3', '0.001', '10000000', null])
    expect(parseAmount(value)).toBeNull()
  expect(parseAmount(' 12.30 ')).toBe(1230)
  expect(parseAmount('0.01')).toBe(1)
})
it('取实际优惠最大规则，不修改原规则，实付不为负', () => {
  const rules = [{ id: 1, consume: 50, discounts: 20 }, { id: 2, consume: 100, discounts: 10 }]
  expect(matchDiscount(rules, 100)?.id).toBe(1)
  expect(rules.map(r => r.id)).toEqual([1, 2])
  expect(quoteBill(100, { id: 3, consume: 0, discounts: 5 }).payableCents).toBe(0)
  expect(quoteBill(1230)).toEqual({ amountCents: 1230, discountCents: 0, payableCents: 1230 })
})
