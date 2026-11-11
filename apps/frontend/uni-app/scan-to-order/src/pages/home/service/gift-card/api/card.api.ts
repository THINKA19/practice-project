/**
 * ============================================================================
 * 【文件概述】卡包请求层，复用 Alova 客户端和现有客户认证。
 * 【方法与导出清单】cardRequests：目录、持卡和开发资产请求。
 * 【综合使用示例】
 * import { cardRequests } from './card.api'
 * const cards = await cardRequests.my() // => 服务端持卡结果
 * ============================================================================
 */
import type { CardTemplate, MyCard } from '../models/types'
import { http } from '@/http/alova'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

export const cardRequests = {
/**
 * 仅开发 Mock 支持的购卡、消费与返还。
 * @param action 'purchase' | 'consume' | 'refund'；模拟资产动作。
 * @param id number；购买传模板编号，其他动作传持卡编号。
 * @returns Promise<unknown>；生产环境发送前拒绝，失败不重试。
 * @example await cardRequests.demoAction('purchase', 1) // => 开发 Mock 增加持卡
 */
  demoAction(action: 'purchase' | 'consume' | 'refund', id: number) {
    if (!(import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'))
      return Promise.reject(new Error('仅开发 Mock 支持演示操作'))
    return http.Post<unknown>(endpoints.demoAction, { action, id }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  /**
   * 查询可售模板。
   * @param data { status?: number }；可选模板状态筛选。
   * @returns Promise<CardTemplate[] | null>；空结果由调用方处理。
   * @example await cardRequests.list({ status: 0 }) // => 模板列表
   */
  list(data: { status?: number } = {}) {
    return http.Get<CardTemplate[] | null>(endpoints.list, { params: data, cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  /**
   * 查询当前客户卡包。
   * 无参数。
   * @returns Promise<MyCard[] | null>；失败拒绝，不缓存。
   * @example await cardRequests.my() // => 当前客户持卡列表
   */
  my() {
    return http.Get<MyCard[] | null>(endpoints.my, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
