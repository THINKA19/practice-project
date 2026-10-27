import type { MyQueueRecordDto as MyQueueRecord, QueueActionDto as QueueAction, QueueSnapshotDto as QueueSnapshot } from './queue.dto'
import { endpoints } from './endpoints'
import { http } from '@/http/alova'

export const queueRequests = {
  cancel: (id: number) => http.Post(endpoints.cancel, { id }),
  demo: () => http.Get<QueueSnapshot>(endpoints.demo, { cacheFor: 0 }),
  demoAction: (action: QueueAction, id: number) => http.Post(endpoints.demoAction, { action, id }),
  take: (typeId: number) => http.Post(endpoints.take, { typeId, mobile: '' }),
  myRecords: () => http.Get<MyQueueRecord[]>(endpoints.my, { cacheFor: 0 }),
}
