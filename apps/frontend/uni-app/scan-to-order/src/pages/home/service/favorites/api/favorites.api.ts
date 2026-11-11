/**
 * ============================================================================
 * 【文件概述】service/favorites/api/favorites.api.ts，负责业务请求与接口契约。
 * 【方法与导出清单】favoritesApi
 * 【综合使用示例】
 * import { favoritesApi } from '@/pages/home/service/favorites/api/favorites.api'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import type { FavoritePage } from '../models/types'
import { http } from '@/http/alova'
import { getAuthorizationHeaders, getToken } from '@/pages/auth/session'
import { endpoints } from './endpoints'

/** 收藏请求，使用现有客户端与当前顾客凭证。 */
export const favoritesApi = {
  /**
   * 分页查询收藏，page 从 1 开始。
   * @param page number，用于 list 操作。
   * @param pageSize number，用于 list 操作。
   * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
   * @example // list 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  list(page: number, pageSize: number) {
    return http.Get<FavoritePage>(endpoints.list, { params: { page, pageSize }, headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}, cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
  /**
   * 取消当前顾客收藏，成功后重新查询分页。
   * @param id number，用于 remove 操作。
   * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
   * @example // remove 的调用参数及接入位置见本文件顶部示例和所属页面。
   */
  remove(id: number) {
    return http.Post<null>(endpoints.remove, { id }, { headers: getAuthorizationHeaders('customer'), cacheFor: 0, meta: { ignoreAuth: true, toast: false } }).send()
  },
}
