/**
 * ============================================================================
 * 【文件概述】所属业务的内存模拟状态，实例只在开发会话中存在。
 * 【方法与导出清单】createQueueState、queueState、demoQueueState。
 * 【综合使用示例】
 * import { createQueueState } from '@/pages/queue/index/mock/state'
 * ============================================================================
 */
import type { MyQueue, MyQueueRecord, QueueAction } from '../models/types'
import { queueStatus } from '../models/enums'
import { createQueueTypes } from './data'
/**
 * 创建可重置的排队发号与状态操作。
 * 无参数。
 * @returns 包含查询、操作和 reset 的独立内存状态。
 * @example createQueueState() // 返回独立状态实例，含 reset()
 */
export function createQueueState() {
  const types = createQueueTypes()
  const entries: { owner: string, log: MyQueue }[] = []
  let nextId = 1
  function reset() {
    types.splice(0, types.length, ...createQueueTypes())
    entries.length = 0
    nextId = 1
    for (const type of types) {
      for (let number = (type.curNumber ?? 0) + 1;
        number <= (type.numberGet ?? 0);
        number++)
        entries.push({ owner: `seed-${nextId}`, log: { id: nextId++, typeId: type.id, number, status: queueStatus.waiting } })
    }
  }
  reset()
  function listTypes() {
    return types.map(type => ({ ...type, numberWait: entries.filter(e => e.log.typeId === type.id && e.log.status === queueStatus.waiting).length }))
  }
  function my(owner: string): MyQueueRecord[] {
    return entries.filter(e => e.owner === owner).map(({ log }) => {
      const type = listTypes().find(t => t.id === log.typeId)!
      const aheadTables = entries.filter(e => e.log.typeId === log.typeId && e.log.number < log.number && (e.log.status === queueStatus.waiting || e.log.status === queueStatus.called)).length
      return { queuingLog: { ...log, aheadTables }, queuingUpType: { ...type } }
    })
  }
  function take(owner: string, typeId: number) {
    const type = types.find(item => item.id === typeId)
    if (!type || type.status !== 0 || entries.some(e => e.owner === owner && (e.log.status === queueStatus.waiting || e.log.status === queueStatus.called)))
      return false
    type.numberGet = (type.numberGet ?? 0) + 1
    entries.push({ owner, log: { id: nextId++, typeId, number: type.numberGet, status: queueStatus.waiting, dateAdd: new Date().toISOString() } })
    return true
  }
  function action(owner: string, action: QueueAction, id: number) {
    if (action === 'take')
      return take(owner, id)
    if (action === 'call') {
      const type = types.find(t => t.id === id)
      if (!type)
        return false
      const next = entries.find(e => e.log.typeId === id && e.log.status === queueStatus.waiting)
      if (!next)
        return false
      for (const e of entries.filter(e => e.log.typeId === id && e.log.status === queueStatus.called))
        e.log.status = queueStatus.missed
      next.log.status = queueStatus.called
      type.curNumber = next.log.number
      return true
    }
    const entry = entries.find(e => e.owner === owner && e.log.id === id)
    if (!entry)
      return false
    if (action === 'cancel' && (entry.log.status === queueStatus.waiting || entry.log.status === queueStatus.called)) {
      entry.log.status = queueStatus.cancelled
      return true
    }
    if (action === 'seat' && entry.log.status === queueStatus.called) {
      entry.log.status = queueStatus.seated
      return true
    }
    return false
  }
  return { types: listTypes, my, take, action, reset }
}

export const queueState = createQueueState()
export const demoQueueState = createQueueState()
