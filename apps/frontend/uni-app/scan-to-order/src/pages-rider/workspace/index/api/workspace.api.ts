/**
 * ============================================================================
 * 【文件概述】骑手工作台的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - fetchRiderWorkspace：通过公共 HTTP 读取工作台公告与目标配置，不缓存。
 * 【综合使用示例】
 * import { fetchRiderWorkspace } from '@/pages-rider/workspace/index/api/workspace.api'
 * await fetchRiderWorkspace() // Promise 返回工作台配置
 * ============================================================================
 */
import { USE_MOCK } from '@/mock/config'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { RiderWorkspaceDto } from './workspace.dto'
import { endpoints } from './endpoints'
/**
 * 通过公共 HTTP 读取工作台公告与目标配置，不缓存。
 * 无参数。
 * @returns Promise<RiderWorkspaceDto>；Promise 返回工作台配置
 * @example await fetchRiderWorkspace() // Promise 返回工作台配置
 */
export async function fetchRiderWorkspace(): Promise<RiderWorkspaceDto> {
  const headers = getAuthorizationHeaders('rider')
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).read(headers.Authorization)
  }
  if (import.meta.env.VITE_RIDER_BACKEND_ENABLED !== 'true')
    throw new Error('骑手业务服务尚未接通，请联系管理员')
  return http.Get<RiderWorkspaceDto>(endpoints.overview, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
