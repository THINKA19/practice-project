/**
 * ============================================================================
 * 【文件概述】卡包 Mock 只拥有账户持卡和资产编号；流水与赠送经专用出口联动。
 * 【方法与导出清单】createCardState、cards、nextId、owner、reset、addCard、transferCard。
 * 【综合使用示例】
 * import { cards } from '@/pages/home/service/gift-card/mock'
 * const mine = cards('demo-account') // => 当前演示账户的持卡
 * ============================================================================
 */
import type { MyCard } from '../models/types'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { logState } from '../../gift-card-logs/mock'
import { shareState } from '../../gift-card-send/mock'
import { templates } from './fixtures/cards'

/**
 * 创建卡包状态，注入所属领域的模拟联动能力。
 * @param events typeof logState；独立流水实例。
 * @param sharing typeof shareState；独立分享实例。
 * @returns 卡包读取、编号与重置操作；账户资产保存在本实例。
 * @example const state = createCardState(events, sharing) // => 独立卡包
 */
export function createCardState(events: typeof logState, sharing: typeof shareState) {
  const logState = events
  const shareState = sharing
  const accounts = new Map<string, MyCard[]>()
  let serial = 1
  /**
   * 生成演示持卡编号。
   * 无参数。
   * @returns number；本实例递增编号。
   * @example state.nextId() // => 首次 1
   */
  function nextId() {
    return serial++
  }
  /**
   * 读取或初始化账户卡包；只供 Mock 联动，非生产数据。
   * @param account string；演示账户标识。
   * @returns MyCard[]；本账户持卡对象，写入须通过资产操作。
   * @example state.cards('customer') // => 初始七张演示卡
   */
  function cards(account: string) {
    shareState.expire()
    if (!accounts.has(account)) {
      const used: MyCard = { id: serial++, cardId: templates[7].id, cardInfo: { ...templates[7] }, amount: 60, status: 0, type: 1, isActive: true }
      const gift: MyCard = { id: serial++, cardId: templates[2].id, cardInfo: { ...templates[2] }, amount: 80, status: 0, type: 1, isActive: false }
      const pending: MyCard = { id: serial++, cardId: templates[3].id, cardInfo: { ...templates[3] }, amount: 200, status: 0, type: 1, isActive: false }
      const received: MyCard = { id: serial++, cardId: templates[1].id, cardInfo: { ...templates[1] }, amount: 50, status: 0, type: 1, isActive: true, fromUid: 1, fromUser: { nick: '演示好友' } }
      shareState.issue(account, pending, '送你一份心意')
      const dateEnd = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
      for (const card of [used, gift, pending, received]) card.dateEnd = dateEnd
      const times: MyCard = { id: nextId(), cardId: templates[1].id, cardInfo: { ...templates[1], name: '茶饮三次体验卡', amount: 3 }, amount: 2, type: 0, status: 0, isActive: true, dateEnd }
      const expired: MyCard = { ...gift, id: nextId(), dateEnd: new Date(Date.now() - 86400000).toISOString().slice(0, 10), cardInfo: { ...gift.cardInfo!, name: '已过期演示卡' } }
      const empty: MyCard = { ...used, id: nextId(), amount: 0, cardInfo: { ...used.cardInfo!, name: '已用完演示卡' } }
      const initial = [used, gift, pending, received, times, expired, empty]
      logState.seed(initial)
      accounts.set(account, initial)
    }
    return accounts.get(account)!
  }

  /**
   * 重置本实例持卡与编号。
   * 无参数。
   * @returns {void} 其他领域由各自 entry 重置。
   * @example state.reset() // => 下次读取重新初始化
   */
  function reset() {
    accounts.clear()
    serial = 1
  }
  return { cards, nextId, reset }
}
const cardState = createCardState(logState, shareState)
/** 当前卡包操作；方法契约见 createCardState 内相应声明。 */
export const { cards, nextId, reset } = cardState
/**
 * 从演示凭证取得客户标识，拒绝非演示身份。
 * @param authorization unknown；Authorization 请求头。
 * @returns string；无效凭证抛出 Error。
 * @example owner('Bearer wx-demo-session-customer') // => 演示账户标识
 */
export function owner(authorization: unknown) {
  if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization)))
    throw new Error('请先登录顾客账户')
  return mockCustomerOwner(authorization)
}
/**
 * 向账户添加一张新卡，复制嵌套模板以避免样本串改。
 * @param account string；接收资产的账户。
 * @param templateId number；已存在的模板编号。
 * @returns MyCard；模板不存在则抛错，成功后卡片位于卡包首部。
 * @example addCard('customer', 1) // => 新的 100 元演示卡
 */
export function addCard(account: string, templateId: number): MyCard {
  const template = templates.find(item => item.id === templateId)
  if (!template)
    throw new Error('礼品卡模板不存在')
  const mine = cards(account)
  const card: MyCard = { id: nextId(), cardId: template.id, cardInfo: { ...template }, amount: template.amount, type: 1, status: 0, isActive: false, dateEnd: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) }
  mine.unshift(card)
  return card
}
/**
 * 在演示账户之间转移持卡；领取编排负责凭证及流水。
 * @param sender string；原持卡账户。
 * @param recipient string；接收账户。
 * @param cardId number；待转移持卡编号。
 * @returns MyCard；同账户或卡不存在时拒绝，返回接收方持卡。
 * @example transferCard('sender', 'recipient', 7) // => 接收方取得持卡 7
 */
export function transferCard(sender: string, recipient: string, cardId: number): MyCard {
  if (sender === recipient)
    throw new Error('不能领取自己的赠送')
  const source = cards(sender)
  const target = cards(recipient)
  const index = source.findIndex(card => card.id === cardId)
  if (index < 0)
    throw new Error('卡片不存在')
  const card = source[index]
  const received: MyCard = { ...card, cardInfo: card.cardInfo ? { ...card.cardInfo } : undefined, shareToken: '', isActive: true, fromUid: 1, fromUser: { nick: '演示赠送人' } }
  source.splice(index, 1)
  target.push(received)
  return received
}
