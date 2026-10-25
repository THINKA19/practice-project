import { describe, expect, it } from 'vitest'
import { queueWaitMinutes, toMyQueueView } from '../models/queue'

describe('queue', () => {
  it('computes wait minutes = (number - curNumber - 1) * minitus', () => {
    expect(queueWaitMinutes({ number: 10 }, { curNumber: 5, minitus: 3 })).toBe(12)
    expect(queueWaitMinutes({ number: 6 }, { curNumber: 5, minitus: 3 })).toBe(0)
  })

  it('maps record to view with typeEntity and positive waitMinitus only', () => {
    const type = { id: 1, name: 'A', curNumber: 2, minitus: 5 }
    const v = toMyQueueView({ queuingLog: { id: 1, typeId: 1, number: 5, status: 0 }, queuingUpType: type })
    expect(v.typeEntity).toBe(type)
    expect(v.waitMinitus).toBe(10)
    const v2 = toMyQueueView({ queuingLog: { id: 2, typeId: 1, number: 2, status: 0 }, queuingUpType: type })
    expect(v2.waitMinitus).toBeUndefined()
  })
})
