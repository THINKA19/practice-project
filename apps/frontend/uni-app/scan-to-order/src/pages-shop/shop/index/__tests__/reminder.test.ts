import { describe, expect, it } from 'vitest'
import { createReminderQueue } from '../models/reminder'

describe('门店提醒队列', () => {
  it('拒绝越店、无权限以及重复事件', () => {
    const queue = createReminderQueue()
    queue.switchShop('A')
    const event = { id: '1', shopId: 'A', kind: 'new-order' as const }
    expect(queue.push(event, false)).toBe(false)
    expect(queue.push({ ...event, shopId: 'B' }, true)).toBe(false)
    expect(queue.push(event, true)).toBe(true)
    expect(queue.push(event, true)).toBe(false)
    expect(queue.next()).toEqual(event)
    expect(queue.next()).toBeUndefined()
  })
  it('切店丢弃旧店待播放事件', () => {
    const queue = createReminderQueue()
    queue.switchShop('A')
    queue.push({ id: '1', shopId: 'A', kind: 'ready' }, true)
    queue.switchShop('B')
    expect(queue.next()).toBeUndefined()
    expect(queue.push({ id: '2', shopId: 'A', kind: 'ready' }, true)).toBe(false)
  })
})
