/**
 * ============================================================================
 * 【文件概述】配送任务的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - isRiderDemo：当前骑手演示可用性。
 * - fetchRiderTasks：通过公共 HTTP 获取任务快照，由模型边界验证后进入状态。
 * - setRiderOnline：提交上下线状态，客户端等待服务端确认后刷新。
 * - submitRiderAction：提交任务 id、版本和动作；凭证仅放请求头。
 * 【综合使用示例】
 * import { isRiderDemo } from '@/pages-rider/delivery/task/api/tasks.api'
 * isRiderDemo // 开发环境启用 Mock 时为 true
 * ============================================================================
 */
import { http } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { RiderAction, RiderOrder } from '../models/types'
import type { RiderOnlineDto, RiderTaskActionDto } from './tasks.dto'
import { validateSnapshot } from '../models/mappers'
import { endpoints } from './endpoints'

/**
 * 当前骑手演示可用性。
 * @example isRiderDemo // 开发环境启用 Mock 时为 true
 */
export const isRiderDemo = import.meta.env.DEV && USE_MOCK

function assertBusinessService() {
  if (import.meta.env.VITE_RIDER_BACKEND_ENABLED !== 'true')
    throw new Error('骑手业务服务尚未接通，请联系管理员')
}

/**
 * 通过公共 HTTP 获取任务快照，由模型边界验证后进入状态。
 * 无参数。
 * @returns Promise 返回待验证的任务快照
 * @example await fetchRiderTasks() // Promise 返回待验证的任务快照
 */
export async function fetchRiderTasks(includeNew = true) {
  const headers = getAuthorizationHeaders('rider')
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).snapshot(headers.Authorization, includeNew)
  }
  assertBusinessService()
  const data = await http.Get<unknown>(endpoints.tasks, { headers, params: { view: includeNew ? 'workspace' : 'fulfillment' }, cacheFor: 0, meta: { toast: false } }).send()
  return validateSnapshot(data, true)
}
/**
 * 提交上下线状态，客户端等待服务端确认后刷新。
 * @param online {boolean} 是否接单
 * @returns Promise 完成后重新读取任务快照
 * @example await setRiderOnline(true) // Promise 完成后重新读取任务快照
 */
export async function setRiderOnline(online: boolean) {
  const headers = getAuthorizationHeaders('rider')
  const data: RiderOnlineDto = { online }
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).setOnline(headers.Authorization, online)
  }
  assertBusinessService()
  if (online) {
    try {
      const position = await uni.getLocation({ type: 'wgs84' })
      data.location = { latitude: position.latitude, longitude: position.longitude, accuracy: position.accuracy }
    }
    catch {
      throw new Error('无法获取当前位置，请开启定位权限后重试')
    }
    if (headers.Authorization !== getAuthorizationHeaders('rider').Authorization)
      throw new Error('骑手会话已变更，请重试')
  }
  return http.Post(endpoints.online, data, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
/**
 * 提交任务 id、版本和动作；凭证仅放请求头。
 * @param order {RiderOrder} 当前任务及版本
 * @param action {RiderAction} 所提交的配送动作
 * @param reason 异常说明，最多 200 字
 * @returns 服务端验证后进入配送中
 * @example await submitRiderAction(order, 'pickup') // 服务端验证后进入配送中
 */
export async function submitRiderAction(order: RiderOrder, action: RiderAction, reason = '') {
  const headers = getAuthorizationHeaders('rider')
  const data: RiderTaskActionDto = { id: order.id, version: order.version, action, reason }
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).act(headers.Authorization, data, action, reason)
  }
  assertBusinessService()
  return http.Post(endpoints.action, data, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
