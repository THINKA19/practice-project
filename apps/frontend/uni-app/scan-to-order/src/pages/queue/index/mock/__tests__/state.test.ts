import { expect, it } from 'vitest'
import { createQueueState } from '../state'

it('allocates unique numbers globally and rejects multiple active tickets and paused types', () => {
  const b = createQueueState()
  expect(b.take('a', 1)).toBe(true)
  expect(b.take('b', 1)).toBe(true)
  expect(b.my('a')[0].queuingLog.number).toBe(11)
  expect(b.my('b')[0].queuingLog.number).toBe(12)
  expect(b.take('a', 2)).toBe(false)
  expect(b.take('c', 4)).toBe(false)
  expect(b.types()[0].numberWait).toBe(4)
  const copy = b.my('a')
  copy[0].queuingLog.status = 3
  expect(b.my('a')[0].queuingLog.status).toBe(0)
})
it('rejects invalid transitions and other owners, handles cancellations, missed calls and seating', () => {
  const b = createQueueState()
  b.take('a', 3)
  b.take('b', 3)
  const a = b.my('a')[0].queuingLog.id
  expect(b.action('b', 'cancel', a)).toBe(false)
  expect(b.action('a', 'seat', a)).toBe(false)
  expect(b.action('a', 'call', 3)).toBe(true)
  expect(b.action('a', 'call', 3)).toBe(true)
  expect(b.my('a')[0].queuingLog.status).toBe(4)
  expect(b.action('a', 'seat', a)).toBe(false)
  const other = b.my('b')[0].queuingLog.id
  expect(b.action('b', 'seat', other)).toBe(true)
  expect(b.take('a', 3)).toBe(true)
  const second = b.my('a')[1].queuingLog.id
  expect(b.action('a', 'cancel', second)).toBe(true)
  expect(b.types().find(t => t.id === 3)?.numberWait).toBe(0)
})
