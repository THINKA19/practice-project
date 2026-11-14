export type ReminderKind = 'new-order' | 'ready'
export interface ShopReminder {
  id: string
  shopId: string
  kind: ReminderKind
}

/** 同一事件只消费一次；切店后旧事件不进入播放队列。 */
export function createReminderQueue() {
  const seen = new Set<string>()
  const queue: ShopReminder[] = []
  let shopId = ''
  return {
    switchShop(value: string) {
      shopId = value
      queue.length = 0
      seen.clear()
    },
    push(event: ShopReminder, allowed: boolean) {
      if (!allowed || event.shopId !== shopId || seen.has(event.id))
        return false
      seen.add(event.id)
      if (seen.size > 500)
        seen.delete(seen.values().next().value!)
      if (queue.length < 20)
        queue.push(event)
      return true
    },
    next: () => queue.shift(),
    clear() { queue.length = 0 },
  }
}
