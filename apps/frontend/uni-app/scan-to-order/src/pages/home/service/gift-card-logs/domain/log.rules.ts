/**
 * ============================================================================
 * 【文件概述】流水纯展示规则，不依赖 UI 或请求客户端。
 * 【方法与导出清单】cardLogTitle、cardLogAmount。
 * 【综合使用示例】
 * import { cardLogAmount } from './log.rules'
 * cardLogAmount({ id: 1, amount: 1, dateAdd: '' }, 0) // => '−1 次'
 * ============================================================================
 */
import type { CardLog } from '../models/types'

const titles = { purchase: '购卡入账', consume: '订单抵扣', refund: '退款返还', exchange: '兑换入卡', share: '发起赠送', cancel: '撤回赠送', receive: '领取礼品卡', shareExpired: '赠送已过期' }
/**
 * 返回事件名称；未知类型保留服务端说明。
 * @param log CardLog；单条服务端流水。
 * @returns string；已知事件中文名称或旧接口说明。
 * @example cardLogTitle({ id: 1, amount: 0, dateAdd: '', eventType: 'receive' }) // => '领取礼品卡'
 */
export function cardLogTitle(log: CardLog): string {
  return (log.eventType && Object.prototype.hasOwnProperty.call(titles, log.eventType) && titles[log.eventType]) || log.typeStr || '礼品卡消费'
}

/**
 * 按收支方向展示金额或次数，非资产事件不显示扣款。
 * @param log CardLog；单条流水。
 * @param type number；0 次卡，1 储值卡，缺省为 1。
 * @returns string；带方向的数值，非资产事件返回破折号。
 * @example cardLogAmount({ id: 1, amount: 10, dateAdd: '', direction: 'credit' }) // => '+¥10'
 */
export function cardLogAmount(log: CardLog, type = 1): string {
  if (log.direction === 'none')
    return '—'
  const sign = log.direction === 'credit' || log.eventType === 'refund' ? '+' : '−'
  return type === 0 ? `${sign}${Math.abs(log.amount)} 次` : `${sign}¥${Math.abs(log.amount)}`
}
