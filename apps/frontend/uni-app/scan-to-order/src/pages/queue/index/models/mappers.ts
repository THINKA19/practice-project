import type { MyQueueRecord, MyQueueView } from './types'
import { queueWaitMinutes } from '../domain/queue.rules'

/** 合并排队记录与队列配置；等待中记录按前方桌数或队列编号计算预计分钟数。 */
export function toMyQueueView(r: MyQueueRecord): MyQueueView {
  const view: MyQueueView = { ...r.queuingLog, typeEntity: r.queuingUpType }
  const wait = r.queuingLog.status === 0 ? r.queuingLog.aheadTables === undefined ? queueWaitMinutes(r.queuingLog, r.queuingUpType) : r.queuingLog.aheadTables * (r.queuingUpType.minitus ?? 0) : 0
  if (wait > 0) {
    view.waitMinitus = wait
  }
  return view
}
