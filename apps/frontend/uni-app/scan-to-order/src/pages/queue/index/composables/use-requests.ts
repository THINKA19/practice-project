import { queueRequests } from '../api/queue.api'
import type { QueueType } from '../models/types'
import { endpoints } from '../api/endpoints'
import { http } from '@/http/alova'

/** 排队业务门面：兼容数组和 result 列表响应；取号与取消仍等待接口结果。 */
export const queueApi = {
  cancel: queueRequests.cancel,
  demo: queueRequests.demo,
  demoAction: queueRequests.demoAction,
  async types(): Promise<QueueType[]> {
    const result = await http.Get<{ result: QueueType[] } | QueueType[]>(endpoints.types, { cacheFor: 0 })
    return Array.isArray(result) ? result : result.result ?? []
  },
  take: queueRequests.take,
  myRecords: queueRequests.myRecords,
}
