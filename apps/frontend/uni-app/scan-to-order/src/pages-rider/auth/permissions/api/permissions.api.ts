/**
 * ============================================================================
 * 【文件概述】骑手资格与权限的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - fetchRiderGrant：通过公共 HTTP 读取资格及具体操作权限，不缓存授权。
 * 【综合使用示例】
 * import { fetchRiderGrant } from '@/pages-rider/auth/permissions/api/permissions.api'
 * await fetchRiderGrant() // Promise 返回服务端授权资料
 * ============================================================================
 */
import { USE_MOCK } from '@/mock/config'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { RiderGrantDto } from './permissions.dto'
import { endpoints } from './endpoints'

/**
 * 通过公共 HTTP 读取资格及具体操作权限，不缓存授权。
 * 无参数。
 * @returns Promise<RiderGrantDto>；Promise 返回服务端授权资料
 * @example await fetchRiderGrant() // Promise 返回服务端授权资料
 */
export async function fetchRiderGrant(): Promise<RiderGrantDto> {
  const headers = getAuthorizationHeaders('rider')
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).read(headers.Authorization)
  }
  if (import.meta.env.VITE_RIDER_BACKEND_ENABLED !== 'true')
    throw new Error('骑手业务服务尚未接通，请联系管理员')
  return http.Get<RiderGrantDto>(endpoints.grant, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
