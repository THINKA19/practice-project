/**
 * ============================================================================
 * 【文件概述】个人中心的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - fetchRiderAccount：通过公共 HTTP 读取账户概览，携带骑手凭证且不缓存。
 * 【综合使用示例】
 * import { fetchRiderAccount } from '@/pages-rider/account/index/api/account.api'
 * await fetchRiderAccount() // Promise 返回账户概览，服务未启用时拒绝
 * ============================================================================
 */
import { USE_MOCK } from '@/mock/config'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { RiderAccountDto } from './account.dto'
import { endpoints } from './endpoints'
/**
 * 通过公共 HTTP 读取账户概览，携带骑手凭证且不缓存。
 * 无参数。
 * @returns Promise<RiderAccountDto>；Promise 返回账户概览，服务未启用时拒绝
 * @example await fetchRiderAccount() // Promise 返回账户概览，服务未启用时拒绝
 */
export async function fetchRiderAccount(): Promise<RiderAccountDto> {
  const headers = getAuthorizationHeaders('rider')
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).read(headers.Authorization)
  }
  if (import.meta.env.VITE_RIDER_BACKEND_ENABLED !== 'true')
    throw new Error('骑手业务服务尚未接通，请联系管理员')
  return http.Get<RiderAccountDto>(endpoints.overview, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
