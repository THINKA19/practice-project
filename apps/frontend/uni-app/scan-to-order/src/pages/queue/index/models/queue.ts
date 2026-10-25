export interface QueueType {
  id: number
  name: string
  /** 当前叫号 */
  curNumber?: number
  /** 已取号数量 */
  numberGet?: number
  /** 等待人数 */
  numberWait?: number
  minutes?: number
  minPeople?: number
  maxPeople?: number
  status?: number
}

export interface MyQueue {
  id: number
  typeId: number
  number: number
  status: number
  statusStr?: string
  aheadTables?: number
  dateAdd?: string
}

/** 我前面还有几桌 */
export function aheadCount(my: MyQueue, type?: QueueType): number {
  if (!type?.curNumber) {
    return Math.max(0, my.number - 1)
  }
  return Math.max(0, my.number - type.curNumber)
}

/** 取号类型（/queuing/my 返回的 queuingUpType，含每号预计分钟数 minitus） */
export interface QueueUpType extends QueueType {
  /** 每个号预计等待分钟数（接口字段原拼写） */
  minitus?: number
}

/** /queuing/my 原始记录 */
export interface MyQueueRecord {
  queuingLog: MyQueue
  queuingUpType: QueueUpType
}

/** 我的号（页面展示用）：原 queuingMy 把类型挂在 typeEntity、等待时间挂在 waitMinitus */
export interface MyQueueView extends MyQueue {
  typeEntity: QueueUpType
  /** 预计等待分钟数；无需等待时不存在 */
  waitMinitus?: number
}

/** 预计等待分钟数 = (我的号 - 当前叫号 - 1) * 每号分钟数 */
export function queueWaitMinutes(log: Pick<MyQueue, 'number'>, type: Pick<QueueUpType, 'curNumber' | 'minitus'>): number {
  const n = (Number(log.number) - Number(type.curNumber || 0) - 1) * Number(type.minitus || 0)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

export function toMyQueueView(r: MyQueueRecord): MyQueueView {
  const view: MyQueueView = { ...r.queuingLog, typeEntity: r.queuingUpType }
  const wait = r.queuingLog.status === 0 ? r.queuingLog.aheadTables === undefined ? queueWaitMinutes(r.queuingLog, r.queuingUpType) : r.queuingLog.aheadTables * (r.queuingUpType.minitus ?? 0) : 0
  if (wait > 0) {
    view.waitMinitus = wait
  }
  return view
}

export type QueueAction = 'take' | 'cancel' | 'call' | 'seat'
export interface QueueSnapshot { types: QueueType[], records: MyQueueRecord[] }
export const queueStatus = { waiting: 0, called: 1, seated: 2, cancelled: 3, missed: 4 } as const
