/**
 * ============================================================================
 * 【文件概述】卡包模拟请求：模板、持卡与开发资产动作。
 * 【方法与导出清单】default：本模块 MockWrapper。
 * 【综合使用示例】
 * import handlers from './handlers'
 * const routes = handlers.data // => 仅卡包所属接口
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { templates } from './fixtures/cards'
import { addCard, cards, owner } from './state'
import { logState } from '../../gift-card-logs/mock'

export default defineMock({
  [`[POST]${endpoints.demoAction}`]: withFailure(({ headers, data }) => {
    const account = owner(headers.Authorization)
    const input = data as { action?: string, id?: number }
    if (input.action === 'purchase') {
      const card = addCard(account, Number(input.id))
      logState.record(card, 'purchase', 'credit', card.amount, '开发模拟购卡，未发生支付')
      return ok(null)
    }
    const card = cards(account).find(item => item.id === Number(input.id))
    if (!card || card.shareToken || (card.dateEnd && card.dateEnd < new Date().toISOString().slice(0, 10)))
      return fail('卡片不存在、已过期或正在赠送')
    if (input.action === 'consume') {
      if (card.amount <= 0)
        return fail('卡片余额或次数不足')
      const amount = Math.min(card.amount, card.type === 0 ? 1 : 10)
      card.amount -= amount
      card.isActive = true
      logState.record(card, 'consume', 'debit', amount, '开发模拟消费，未创建真实订单')
      return ok(null)
    }
    if (input.action === 'refund') {
      const rows = logState.read(card.id)
      const debit = rows.find(row => row.eventType === 'consume' && row.remark === '开发模拟消费，未创建真实订单' && !rows.some(refund => refund.relatedLogId === row.id))
      if (!debit)
        return fail('请先模拟消费，没有可返还的演示扣款')
      card.amount += debit.amount
      logState.record(card, 'refund', 'credit', debit.amount, '开发模拟返还，未发生真实退款', debit.id)
      return ok(null)
    }
    return fail('不支持的演示操作')
  }, { write: true }),
  [`[GET]${endpoints.list}`]: withFailure(() => ok(templates.map(item => ({ ...item })))),
  [`[GET]${endpoints.my}`]: withFailure(({ headers }) => ok(cards(owner(headers.Authorization)).map(card => ({ ...card })))),
})
