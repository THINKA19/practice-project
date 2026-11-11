/**
 * ============================================================================
 * 【文件概述】兑换请求唯一登记，编排本模块兑换记录与卡包发卡。
 * 【方法与导出清单】default、reset。
 * 【综合使用示例】
 * import entry from './entry.mock'
 * const routes = entry.data // => POST /card/exchange
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { addCard, owner } from '../../gift-card/mock'
import { logState } from '../../gift-card-logs/mock'
import { createExchangeFixture } from './data'
import { exchangeState } from './state'

export { reset } from './state'

export default defineMock({
  [`[POST]${endpoints.exchange}`]: withFailure(({ headers, data }) => {
    const account = owner(headers.Authorization)
    const fixture = createExchangeFixture()
    const number = (data as { number?: unknown }).number
    if (number !== fixture.number)
      return fail('演示兑换码为 GIFT-DEMO')
    if (exchangeState.has(account, number))
      return fail('本账户已使用该演示兑换码')
    const card = addCard(account, fixture.templateId)
    logState.record(card, 'exchange', 'credit', card.amount, '兑换码入卡')
    exchangeState.mark(account, number)
    return ok(null)
  }, { write: true }),
})
