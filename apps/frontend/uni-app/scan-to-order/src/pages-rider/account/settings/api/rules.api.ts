/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - fetchRiderRules：读取当前骑手接单规则原始响应，交给模型层验证。
 * 【综合使用示例】
 * import { fetchRiderRules } from '@/pages-rider/account/settings/api/rules.api'
 * await fetchRiderRules() // Promise 返回待验证的规则
 * ============================================================================
 */
import { http } from '@/http/alova'
import { USE_MOCK } from '@/mock/config'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

/**
 * 读取当前骑手接单规则原始响应，交给模型层验证。
 * 无参数。
 * @returns Promise 返回待验证的规则
 * @example await fetchRiderRules() // Promise 返回待验证的规则
 */
export async function fetchRiderRules() {
  const headers = getAuthorizationHeaders('rider')
  if (import.meta.env.DEV && USE_MOCK) {
    // eslint-disable-next-line project-mock/boundaries -- 骑手模块的开发模拟入口，生产构建移除。
    return (await import('../mock')).read(headers.Authorization)
  }
  if (import.meta.env.VITE_RIDER_BACKEND_ENABLED !== 'true')
    throw new Error('骑手业务服务尚未接通，请联系管理员')
  return await http.Get<unknown>(endpoints.rules, { headers, cacheFor: 0, meta: { toast: false } }).send()
}
