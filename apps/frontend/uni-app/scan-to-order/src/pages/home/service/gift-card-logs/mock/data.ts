/**
 * ============================================================================
 * 【文件概述】流水领域的初始样本工厂；只接收持卡编号和余额，不拥有卡包。
 * 【方法与导出清单】createInitialLogs：为七种演示持卡生成独立事件样本。
 * 【综合使用示例】
 * import { createInitialLogs } from './data'
 * const rows = createInitialLogs([{ id: 7, amount: 60 }]) // => 持卡 7 的 24 条流水
 * ============================================================================
 */
import type { CardLog } from '../models/types'

/**
 * 生成卡包初始样本对应的流水，不改变传入资产。
 * @param cards 只读持卡摘要；顺序为已使用、可赠送、赠送中、已领取、次卡、过期、耗尽。
 * @returns 各持卡的独立流水数组；第一张 24 条，其余一条来源事件。
 * @example createInitialLogs([{ id: 7, amount: 60 }])[0].rows.length // => 24
 */
export function createInitialLogs(cards: readonly { id: number, amount: number }[]): { cardId: number, rows: CardLog[] }[] {
  const events = [
    { eventType: 'consume', direction: 'debit', remark: '' },
    { eventType: 'exchange', direction: 'credit', remark: '演示兑换入卡，尚未消费' },
    { eventType: 'share', direction: 'none', remark: '等待好友领取' },
    { eventType: 'receive', direction: 'credit', remark: '演示好友赠送，尚未消费' },
    { eventType: 'consume', direction: 'debit', remark: '演示次卡消费' },
    { eventType: 'exchange', direction: 'credit', remark: '已过期演示样本' },
    { eventType: 'consume', direction: 'debit', remark: '最后一笔演示消费' },
  ] as const
  return cards.map((card, position) => {
    if (position === 0) {
      let balance = card.amount
      const rows = Array.from({ length: 24 }, (_, index): CardLog => {
        const refund = index === 0
        const amount = index === 1 ? 30 : 10
        const row: CardLog = { id: 24 - index, eventType: refund ? 'refund' : 'consume', direction: refund ? 'credit' : 'debit', amount, balance, remark: refund ? '演示订单退款返还' : '演示订单抵扣（未关联真实订单）', dateAdd: new Date(Date.now() - index * 86400000).toISOString().slice(0, 16).replace('T', ' ') }
        balance += refund ? -amount : amount
        return row
      })
      return { cardId: card.id, rows }
    }
    const event = events[position]
    if (!event)
      return { cardId: card.id, rows: [] }
    const amount = position === 2 ? 0 : position === 4 ? 1 : position === 6 ? 10 : card.amount
    return { cardId: card.id, rows: [{ id: 1, ...event, amount, balance: card.amount, dateAdd: new Date().toISOString().slice(0, 19).replace('T', ' ') }] }
  })
}
