/**
 * ============================================================================
 * 【文件概述】赠送与撤回唯一请求登记；本模块管理凭证，卡包管理资产。
 * 【方法与导出清单】default、reset。
 * 【综合使用示例】
 * import entry from './entry.mock'
 * const routes = entry.data // => 签发与撤回接口
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { cards, owner } from '../../gift-card/mock'
import { logState } from '../../gift-card-logs/mock'
import { shareState } from './state'

export { reset } from './state'

export default defineMock({
  [`[POST]${endpoints.shareOpen}`]: withFailure(({ headers, data }) => {
    const account = owner(headers.Authorization)
    const input = data as { id?: unknown, remark?: unknown }
    const card = cards(account).find(item => item.id === Number(input.id))
    if (!card || card.isActive || card.fromUid || card.amount <= 0 || (card.dateEnd && card.dateEnd < new Date().toISOString().slice(0, 10)))
      return fail('卡片不可赠送')
    const token = shareState.issue(account, card, String(input.remark || ''))
    logState.record(card, 'share', 'none', 0, String(input.remark || '赠送好友'))
    return ok(token)
  }, { write: true }),
  [`[POST]${endpoints.shareClose}`]: withFailure(({ headers, data }) => {
    const card = cards(owner(headers.Authorization)).find(item => item.id === Number((data as { id?: unknown }).id))
    if (!card)
      return fail('卡片不存在')
    if (card.shareToken) {
      shareState.remove(card.shareToken)
      logState.record(card, 'cancel', 'none')
    }
    card.shareToken = ''
    return ok(null)
  }, { write: true }),
})
