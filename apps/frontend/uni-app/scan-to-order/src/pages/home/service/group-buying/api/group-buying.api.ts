/**
 * ============================================================================
 * 【文件概述】service/group-buying/api/group-buying.api.ts，负责业务请求与接口契约。
 * 【方法与导出清单】groupBuyingApi
 * 【综合使用示例】
 * import { groupBuyingApi } from '@/pages/home/service/group-buying/api/group-buying.api'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import type { GroupBuying, GroupBuyingPage } from '../models/types'
import { http } from '@/http/alova'
import { getAuthorizationHeaders, getToken } from '@/pages/auth/session'
import { endpoints } from './endpoints'
/** 只执行团购请求，页面状态由组合函数维护。 */
export const groupBuyingApi = {
  /**
   * 查询团购列表。
   * @param page number，用于 list 操作。
   * @param pageSize number，用于 list 操作。
   * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
   * @example // list 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  list(page: number, pageSize: number) {
    return http.Get<GroupBuyingPage>(endpoints.list, { params: { page, pageSize }, headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}, cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  /**
   * 查询指定团购。
   * @param id number，用于 detail 操作。
   * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
   * @example // detail 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  detail(id: number) {
    return http.Get<GroupBuying>(endpoints.detail, { params: { id }, headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}, cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  /**
   * 当前顾客参加团购，重复提交由服务端去重。
   * @param id number，用于 join 操作。
   * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
   * @example // join 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  join(id: number) {
    return http.Post<GroupBuying>(endpoints.join, { id }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
