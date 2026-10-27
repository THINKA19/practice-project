/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

/** /queuing/my 原始记录 */
export interface MyQueueRecordDto {
  queuingLog: MyQueueDto
  queuingUpType: QueueUpTypeDto
}

export type QueueActionDto = 'take' | 'cancel' | 'call' | 'seat'

export interface QueueSnapshotDto { types: QueueTypeDto[], records: MyQueueRecordDto[] }

export interface MyQueueDto {
  id: number
  typeId: number
  number: number
  status: number
  statusStr?: string
  aheadTables?: number
  dateAdd?: string
}

/** 取号类型（/queuing/my 返回的 queuingUpType，含每号预计分钟数 minitus） */
export interface QueueUpTypeDto extends QueueTypeDto {
  /** 每个号预计等待分钟数（接口字段原拼写） */
  minitus?: number
}

export interface QueueTypeDto {
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
