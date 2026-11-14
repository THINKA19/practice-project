import { expect, it } from 'vitest'
import type { ShopOrder } from './index'
import { matchesCategory, orderFilters, parseOrderListQuery } from './filters'
import { orderStatusLabel } from './presentation'

const order: ShopOrder = {
  id: 'A-001',
  shopId: 'A',
  version: 1,
  createdAt: '2026-11-14T08:00:00Z',
  address: '',
  customer: '',
  phone: '',
  timeline: [],
  tableNo: '',
  type: '外卖',
  status: 3,
  statusText: '待取餐/配送',
  time: '',
  goods: [],
  remark: '',
}

it('resolves category and dashboard links using known route values', () => {
  expect(parseOrderListQuery({ category: 'dine-in', filter: 'today' })).toEqual({ category: 'dine-in', metric: undefined })
  expect(parseOrderListQuery({ filter: 'pending' })).toEqual({ category: undefined, metric: 'pending' })
  expect(parseOrderListQuery({ category: 'unknown', filter: 'unknown' })).toEqual({ category: undefined, metric: undefined })
})

it('distinguishes rider pickup, delivery and delivered orders', () => {
  const matching = (value: ShopOrder) => orderFilters('delivery', true).filter(tab => tab.matches(value)).map(tab => tab.key)
  expect(matching(order)).toEqual(['all', 'handoff'])
  const delivering = { ...order, deliveryStatus: 'delivering' } as const
  expect(matching(delivering)).toEqual(['all', 'delivering'])
  expect(orderStatusLabel(delivering)).toBe('配送中')
  expect(matching({ ...order, status: 4, deliveryStatus: 'delivered' })).toEqual(['all', 'delivered'])
  expect(matching({ ...order, status: 4 })).toEqual(['all', 'completed'])
})

it('keeps payment and refunds independent of fulfillment and cashier membership', () => {
  const dineIn = { ...order, type: '堂食', paymentStatus: 'unpaid', refundStatus: 'partial', cashier: { number: 'POS-01' } } as const
  expect(matchesCategory(dineIn, 'dine-in')).toBe(true)
  expect(matchesCategory(dineIn, 'cashier')).toBe(true)
  expect(matchesCategory(dineIn, 'pickup')).toBe(false)
  expect(orderFilters('dine-in', true).filter(tab => tab.matches(dineIn)).map(tab => tab.key))
    .toEqual(['all', 'unpaid', 'handoff', 'refunds'])
  expect(orderFilters('dine-in', false).map(tab => tab.key)).not.toContain('refunds')
})
