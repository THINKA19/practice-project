import type { MyQueueRecord, QueueAction, QueueSnapshot, QueueType } from '../models/queue'
import { endpoints } from './endpoints'
import { http } from '@/http/alova'

export const queueApi = {
  cancel: (id: number) => http.Post(endpoints.cancel, { id }),
  demo: () => http.Get<QueueSnapshot>(endpoints.demo, { cacheFor: 0 }),
  demoAction: (action: QueueAction, id: number) => http.Post(endpoints.demoAction, { action, id }),
  async types(): Promise<QueueType[]> {
    const result = await http.Get<{ result: QueueType[] } | QueueType[]>(endpoints.types, { cacheFor: 0 })
    return Array.isArray(result) ? result : result.result ?? []
  },
  take: (typeId: number) => http.Post(endpoints.take, { typeId, mobile: '' }),
  myRecords: () => http.Get<MyQueueRecord[]>(endpoints.my, { cacheFor: 0 }),
}
