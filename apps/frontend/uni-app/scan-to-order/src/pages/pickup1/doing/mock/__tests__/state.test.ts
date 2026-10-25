import { expect, it } from 'vitest'
import { createDemoPickupState } from '@/pages/pickup1/doing/mock'

it('completes only the selected order and preserves preparation, other orders and customers', () => {
  const backend = createDemoPickupState()
  const before = backend.list('customer-a')
  const ready = before.orderList.find(order => order.fulfillment === 'ready')!
  const preparing = before.orderList.find(order => order.fulfillment === 'preparing')!
  expect(ready.id).not.toBe(preparing.id)
  expect(backend.verify('customer-a', preparing.hxNumber)).toBe(false)
  expect(backend.verify('customer-a', 'invalid')).toBe(false)
  expect(backend.verify('customer-a', ready.hxNumber)).toBe(true)
  expect(backend.verify('customer-a', ready.hxNumber)).toBe(false)
  expect(backend.status('customer-a', ready.hxNumber)).toBe(3)
  expect(backend.list('customer-a').orderList).toEqual(before.orderList.filter(order => order.id !== ready.id))
  expect(backend.list('customer-b')).toEqual(before)
})
