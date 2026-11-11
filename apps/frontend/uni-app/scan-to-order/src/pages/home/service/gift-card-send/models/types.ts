/**
 * ============================================================================
 * 【文件概述】赠送领域请求模型，凭证由服务端签发。
 * 【方法与导出清单】CardSendInput、CardCancelInput。
 * 【综合使用示例】
 * import type { CardSendInput } from './types'
 * const input: CardSendInput = { id: 7, remark: '送你一份心意' }
 * ============================================================================
 */
/**
 * 赠送输入：持卡编号与留言，不接受模板编号替代持卡编号。
 * @example const input: CardSendInput = { id: 7, remark: '祝好' }
 */
export interface CardSendInput {
  id: number | string
  remark: string
}

/**
 * 撤回输入：仅撤回当前客户持有卡片的赠送。
 * @example const input: CardCancelInput = { id: 7 }
 */
export interface CardCancelInput {
  id: number | string
}
