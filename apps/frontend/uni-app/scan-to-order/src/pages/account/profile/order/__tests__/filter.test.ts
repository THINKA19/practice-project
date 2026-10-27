import { expect, it } from 'vitest'
import { filterOrders } from '../domain/order.rules'
import type { Order } from '../models/types'

it('按明确类型筛选，未知类型只出现在全部订单中', () => {
  const orders = (['pickup', 'delivery', 'reservation', 'dinein', undefined] as const).map((orderType, id) => ({ id, orderType, orderNumber: String(id), status: 0, amountReal: 10, dateAdd: '2026-10-25' } satisfies Order))

  expect(filterOrders(orders, 'all')).toHaveLength(5)

  expect(filterOrders(orders, 'pickup').map(order => order.id)).toEqual([0])

  expect(filterOrders(orders, 'reservation').map(order => order.id)).toEqual([2])

  expect(filterOrders([], 'delivery')).toEqual([])
})
