import type { MyQueue, QueueType, QueueUpType } from '../models/types'

/** 我前面还有几桌 */
export function aheadCount(my: MyQueue, type?: QueueType): number {
  if (!type?.curNumber) {
    return Math.max(0, my.number - 1)
  }
  return Math.max(0, my.number - type.curNumber)
}

/** 预计等待分钟数 = (我的号 - 当前叫号 - 1) * 每号分钟数 */
export function queueWaitMinutes(log: Pick<MyQueue, 'number'>, type: Pick<QueueUpType, 'curNumber' | 'minitus'>): number {
  const n = (Number(log.number) - Number(type.curNumber || 0) - 1) * Number(type.minitus || 0)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}
