/**
 * ============================================================================
 * 【文件概述】service/group-buying/mock/entry.mock.ts，负责开发 Mock 数据与请求处理。
 * 【方法与导出清单】reset
 * 【综合使用示例】
 * import { reset } from '@/pages/home/service/group-buying/mock/entry.mock'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { fail, ok, paginate } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { endpoints } from '../api/endpoints'
import { createGroups } from './data'

let groups = createGroups()
const memberships = new Map<number, Set<string>>()
/**
 * 将全局团购进度与当前顾客的参团状态组合。
 * @param id number，用于 view 操作。
 * @param auth unknown，用于 view 操作。
 * @returns 按函数签名返回执行结果，响应式操作更新当前实例状态。
 * @example // view 的调用参数及接入位置见本文件顶部示例和所属页面。
 */
function view(id: number, auth: unknown) {
  const item = groups.find(group => group.id === id)
  return item ? { ...item, participating: memberships.get(id)?.has(mockCustomerOwner(auth)) ?? false } : undefined
}
/**
 * 重置团购样本和参团记录。
 * 无参数。
 * @returns {void} 更新本函数所属的页面或模拟状态。
 * @example // reset 的调用参数及接入位置见本文件顶部示例和所属页面。
 */
export function reset() {
  groups = createGroups()
  memberships.clear()
}
export default defineMock({
  [`[GET]${endpoints.list}`]: withFailure(({ headers, query }) => ok(paginate(groups.map(item => view(item.id, headers.Authorization)!), query))),
  [`[GET]${endpoints.detail}`]: withFailure(({ headers, query }) => {
    const item = view(Number(query.id), headers.Authorization)
    return item ? ok(item) : fail('团购不存在')
  }),
  [`[POST]${endpoints.join}`]: withFailure(({ headers, data }) => {
    if (!/^Bearer wx-demo-session-\S+$/.test(String(headers.Authorization)))
      return fail('请先登录顾客账户')
    const id = Number((data as { id?: number }).id)
    const item = groups.find(group => group.id === id)
    if (!item)
      return fail('团购不存在')
    const owner = mockCustomerOwner(headers.Authorization)
    if (memberships.get(id)?.has(owner))
      return ok(view(id, headers.Authorization))
    if (item.endsAt <= Date.now())
      return fail('团购已结束')
    if (item.joined >= item.people)
      return fail('团购已满员')
    if (!memberships.has(id))
      memberships.set(id, new Set())
    memberships.get(id)!.add(owner)
    item.joined++
    return ok(view(id, headers.Authorization))
  }, { write: true }),
})
