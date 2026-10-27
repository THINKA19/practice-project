/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/queue/index/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/queue/index/mock/handlers'
 * ============================================================================
 */
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import type { QueueAction } from '../models/types'
import { queueState as backend, demoQueueState as demo } from './state'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[POST]${endpoints.cancel}`]: withFailure(({ data, headers }) => {
    const id = data && typeof data === 'object' && 'id' in data ? Number(data.id) : 0
    return backend.action(mockCustomerOwner(headers.Authorization), 'cancel', id) ? ok(null) : fail('号码不存在或当前状态不可取消')
  }, { write: true }),
  [`[GET]${endpoints.demo}`]: ({ headers }) => ok({ types: demo.types(), records: demo.my(mockCustomerOwner(headers.Authorization)) }),
  [`[POST]${endpoints.demoAction}`]: ({ data, headers }) => {
    const body = data as { action?: QueueAction, id?: number }
    return body && ['take', 'cancel', 'call', 'seat'].includes(body.action ?? '') && demo.action(mockCustomerOwner(headers.Authorization), body.action!, Number(body.id)) ? ok(null) : fail('操作无效：已有有效号码、桌型暂停或状态已变化')
  },
  [`[GET]${endpoints.types}`]: withFailure(() => ok(backend.types())),
  [`[GET]${endpoints.my}`]: withFailure(({ headers }) => ok(backend.my(mockCustomerOwner(headers.Authorization)))),
  [`[POST]${endpoints.take}`]: withFailure(({ data, headers }) => {
    const typeId = data && typeof data === 'object' && 'typeId' in data ? Number(data.typeId) : 0
    return backend.take(mockCustomerOwner(headers.Authorization), typeId) ? ok(null) : fail('类型无效或已取号')
  }, { write: true }),
})
