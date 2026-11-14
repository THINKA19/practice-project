/**
 * ============================================================================
 * 【文件概述】配送任务的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - default：Alova MockWrapper；路径引用本模块 endpoints。
 * - reset：清空本模块模拟状态。
 * 【综合使用示例】
 * import entry from '@/pages-rider/delivery/task/mock/entry.mock'
 * Object.keys(entry.data) // 测试中检查本模块登记路径
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { endpoints } from '../api/endpoints'
import { act, setOnline, snapshot } from './state'
import type { RiderOnlineDto, RiderTaskActionDto } from '../api/tasks.dto'

export { reset } from './state'
export default defineMock({
  [`[GET]${endpoints.tasks}`]: ({ headers, query }) => ok(snapshot(String(headers.Authorization || ''), query.view !== 'fulfillment')),
  [`[POST]${endpoints.online}`]: ({ headers, data }) => {
    const body = data as RiderOnlineDto
    if (!body || typeof body.online !== 'boolean')
      throw new Error('上线状态不合法')
    setOnline(String(headers.Authorization || ''), body.online, body.location)
    return ok(null)
  },
  [`[POST]${endpoints.action}`]: ({ headers, data }) => {
    const body = data as RiderTaskActionDto
    if (!body || typeof body.id !== 'string' || !Number.isInteger(body.version) || !['grab', 'accept', 'reject', 'pickup', 'finish', 'release', 'exception'].includes(body.action) || typeof body.reason !== 'string')
      throw new Error('任务操作参数不合法')
    act(String(headers.Authorization || ''), body, body.action, body.reason)
    return ok(null)
  },
})
