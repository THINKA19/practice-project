/**
 * ============================================================================
 * 【文件概述】流水请求唯一登记；读卡包验证持卡权，数据由本模块状态提供。
 * 【方法与导出清单】default、reset。
 * 【综合使用示例】
 * import entry from './entry.mock'
 * const routes = entry.data // => POST /card/logs
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { cards, owner } from '../../gift-card/mock'
import { logState } from './state'

export { reset } from './state'

export default defineMock({
  [`[POST]${endpoints.logs}`]: withFailure(({ headers, data }) => {
    const input = data as { cardId?: unknown, page?: unknown, pageSize?: unknown }
    const card = cards(owner(headers.Authorization)).find(item => item.id === Number(input.cardId))
    if (!card)
      return fail('卡片不存在')
    const page = Number(input.page ?? 1)
    const pageSize = Number(input.pageSize ?? 20)
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1)
      return fail('分页参数无效')
    const rows = logState.read(card.id)
    const start = (page - 1) * pageSize
    return ok({ result: rows.slice(start, start + pageSize), totalPage: Math.ceil(rows.length / pageSize) })
  }),
})
