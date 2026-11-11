/**
 * ============================================================================
 * 【文件概述】流水模拟状态，独立拥有事件记录；不查询卡包，不持有分享凭证。
 * 【方法与导出清单】createLogState、logState、reset。
 * 【综合使用示例】
 * import { createLogState } from './state'
 * const state = createLogState()
 * state.read(7) // => []
 * ============================================================================
 */
import type { CardLog } from '../models/types'
import { createInitialLogs } from './data'

/**
 * 创建隔离的流水状态实例。
 * 无参数。
 * @returns 包含 read、replace、record、reset 的实例；记录不暴露内部数组。
 * @example createLogState().read(7) // => []
 */
export function createLogState() {
  const rowsByCard = new Map<number, CardLog[]>()
  return {
    /**
     * 初始化演示持卡的流水样本，样本由本领域 data.ts 维护。
     * @param cards 只读持卡摘要；顺序遵循 createInitialLogs 的样本契约。
     * @returns {void} 为初始持卡写入各自的独立记录。
     * @example state.seed([{ id: 7, amount: 60 }]) // => 生成 24 条演示流水
     */
    seed(cards: readonly { id: number, amount: number }[]) {
      for (const item of createInitialLogs(cards)) rowsByCard.set(item.cardId, item.rows)
    },
    /**
     * 读取流水快照，不泄露内部可变数组。
     * @param cardId number；持卡编号。
     * @returns CardLog[]；独立的流水快照。
     * @example state.read(7) // => 未记录时 []
     */
    read(cardId: number): CardLog[] {
      return (rowsByCard.get(cardId) ?? []).map(row => ({ ...row }))
    },
    /**
     * 替换某持卡流水，用于样本初始化及领取后的隐私隔离。
     * @param cardId number；持卡编号。
     * @param rows CardLog[]；新的流水快照。
     * @returns {void} 不保留调用方数组引用。
     * @example state.replace(7, []) // => 清空持卡 7 的旧流水
     */
    replace(cardId: number, rows: CardLog[]) {
      rowsByCard.set(cardId, rows.map(row => ({ ...row })))
    },
    /**
     * 记录已经完成的资产或赠送事件。
     * @param card { id: number, amount: number }；事件后的持卡快照。
     * @param eventType NonNullable<CardLog['eventType']>；事件名称。
     * @param direction NonNullable<CardLog['direction']>；收支方向。
     * @param amount number；本次绝对数量，默认 0。
     * @param remark string；事件说明，默认空。
     * @param relatedLogId number | undefined；退款关联的消费记录编号。
     * @returns {void} 新事件插入头部，不修改资产。
     * @example state.record({ id: 7, amount: 90 }, 'consume', 'debit', 10) // => 增加一条扣减记录
     */
    record(card: { id: number, amount: number }, eventType: NonNullable<CardLog['eventType']>, direction: NonNullable<CardLog['direction']>, amount = 0, remark = '', relatedLogId?: number) {
      const rows = rowsByCard.get(card.id) ?? []
      rows.unshift({ id: Math.max(0, ...rows.map(row => row.id)) + 1, eventType, direction, amount, balance: card.amount, remark, relatedLogId, dateAdd: new Date().toISOString().slice(0, 19).replace('T', ' ') })
      rowsByCard.set(card.id, rows)
    },
    /**
     * 清理本实例的全部流水。
     * 无参数。
     * @returns {void} 保留实例身份供 handler 继续使用。
     * @example state.reset() // => 所有 read 返回 []
     */
    reset() {
      rowsByCard.clear()
    },
  }
}

/** 当前运行环境唯一流水模拟实例；跨模块仅经 mock/index.ts 使用。 */
export const logState = createLogState()
/**
 * 公共加载器调用的流水重置。
 * 无参数。
 * @returns {void} 只重置本模块状态。
 * @example reset() // => 清空流水
 */
export function reset() {
  logState.reset()
}
