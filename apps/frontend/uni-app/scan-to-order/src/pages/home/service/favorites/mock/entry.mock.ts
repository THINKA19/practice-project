/**
 * ============================================================================
 * 【文件概述】service/favorites/mock/entry.mock.ts，负责开发 Mock 数据与请求处理。
 * 【方法与导出清单】reset
 * 【综合使用示例】
 * import { reset } from '@/pages/home/service/favorites/mock/entry.mock'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { fail, ok, paginate } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { endpoints } from '../api/endpoints'
import { createFavorites } from './data'
import type { FavoriteItem } from '../models/types'

const accounts = new Map<string, FavoriteItem[]>()
/**
 * 获取对应顾客的独立收藏样本。
 * @param auth unknown，用于 rows 操作。
 * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
 * @example // rows 的调用参数及接入位置见本文件顶部示例和所属页面。
 */
function rows(auth: unknown) {
  const owner = mockCustomerOwner(auth)
  if (!accounts.has(owner))
    accounts.set(owner, createFavorites())
  return accounts.get(owner)!
}
/**
 * 重置所有收藏样本。
 * 无参数。
 * @returns {void} 更新本函数所属的页面或模拟状态。
 * @example // reset 的调用参数及接入位置见本文件顶部示例和所属页面。
 */
export function reset() {
  accounts.clear()
}
export default defineMock({
  [`[GET]${endpoints.list}`]: withFailure(({ headers, query }) => ok(paginate(rows(headers.Authorization).map(item => ({ ...item })), query))),
  [`[POST]${endpoints.remove}`]: withFailure(({ headers, data }) => {
    if (!/^Bearer wx-demo-session-\S+$/.test(String(headers.Authorization)))
      return fail('请先登录顾客账户')
    const list = rows(headers.Authorization)
    const index = list.findIndex(item => item.id === Number((data as { id?: number }).id))
    if (index >= 0)
      list.splice(index, 1)
    return ok(null)
  }, { write: true }),
})
