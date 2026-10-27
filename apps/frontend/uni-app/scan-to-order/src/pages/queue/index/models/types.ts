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

export type QueueAction = 'take' | 'cancel' | 'call' | 'seat'

export interface QueueSnapshot { types: QueueType[], records: MyQueueRecord[] }
