/**
 * ============================================================================
 * 【文件概述】骑手资料的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - fetchRiderProfile：读取当前骑手资料原始响应，交给模型层验证。
 * - saveRiderProfile：提交带版本的姓名与电话；冲突由服务端拒绝。
 * 【综合使用示例】
 * import { fetchRiderProfile } from '@/pages-rider/account/profile/api/profile.api'
 * await fetchRiderProfile() // Promise 返回待验证的资料
 * ============================================================================
 */
import { http } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { RiderProfileSaveDto } from './profile.dto'
import { endpoints } from './endpoints'

function assertBusinessService() {
  if (import.meta.env.VITE_RIDER_BACKEND_ENABLED !== 'true')
    throw new Error('骑手业务服务尚未接通，请联系管理员')
}

/**
 * 读取当前骑手资料原始响应，交给模型层验证。
 * 无参数。
 * @returns Promise 返回待验证的资料
 * @example await fetchRiderProfile() // Promise 返回待验证的资料
 */
export async function fetchRiderProfile() {
  const headers = getAuthorizationHeaders('rider')
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).read(headers.Authorization)
  }
  assertBusinessService()
  return await http.Get<unknown>(endpoints.profile, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
/**
 * 提交带版本的姓名与电话；冲突由服务端拒绝。
 * @param data {RiderProfileSaveDto} 本接口请求 DTO
 * @returns Promise 返回更新后资料
 * @example await saveRiderProfile({ version: 1, name: '骑手', phone: '13900000000' }) // Promise 返回更新后资料
 */
export async function saveRiderProfile(data: RiderProfileSaveDto) {
  const headers = getAuthorizationHeaders('rider')
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).save(headers.Authorization, data.version, data.name, data.phone)
  }
  assertBusinessService()
  return await http.Post<unknown>(endpoints.save, data, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
