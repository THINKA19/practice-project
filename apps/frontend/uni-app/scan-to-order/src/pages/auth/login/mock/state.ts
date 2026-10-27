import { sessionState } from '@/pages/auth/session/mock'
/**
 * ============================================================================
 * 【文件概述】所属业务的内存模拟状态，实例只在开发会话中存在。
 * 【方法与导出清单】createWechatState、wechatState。
 * 【综合使用示例】
 * import { createWechatState } from '@/pages/auth/login/mock/state'
 * ============================================================================
 */
import type { IAuthLoginRes } from '@/pages/auth/session'
import type { WechatChannel, WechatStatus, WechatTicket } from '../models/types'
import { AGREEMENT_VERSION } from '../../agreement'
/**
 * 创建带票据有效期和会话隔离的认证模拟状态。
 * @param now 毫秒时间获取函数，测试可注入固定时钟。
 * @returns 包含查询、操作和 reset 的独立内存状态。
 * @example createWechatState() // 返回独立状态实例，含 reset()
 */
export function createWechatState(now = Date.now) {
  const tickets = new Map<string, {
    ticket: WechatTicket
    status: WechatStatus
  }>()

  let sequence = 0

  function start(channel: WechatChannel, version: string) {
    if (version !== AGREEMENT_VERSION)
      return null

    const id = `wx-demo-${++sequence}`

    const ticket: WechatTicket = { id, pollToken: `poll-${id}-${Math.random().toString(36).slice(2)}`, expiresAt: now() + 120000, qrContent: `WECHAT-DEMO-ONLY:${id}` }

    tickets.set(id, { ticket, status: 'pending' })

    return { ...ticket }
  }
  function find(id: string, secret: string) {
    const entry = tickets.get(id)

    if (!entry || entry.ticket.pollToken !== secret)
      return null

    if (now() >= entry.ticket.expiresAt && entry.status !== 'used')
      entry.status = 'expired'

    return entry
  }
  function status(id: string, secret: string) {
    return find(id, secret)?.status ?? 'expired'
  }
  function confirm(id: string, secret: string) {
    const entry = find(id, secret)

    if (!entry || entry.status !== 'pending')
      return false

    entry.status = 'confirmed'

    return true
  }
  function exchange(id: string, secret: string, version: string, double: boolean): IAuthLoginRes | null {
    const entry = find(id, secret)

    if (version !== AGREEMENT_VERSION || !entry || entry.status !== 'confirmed')
      return null

    entry.status = 'used'

    return sessionState.issue('customer', double)
  }
  return { start, status, confirm, exchange, profile: sessionState.profile, reset: () => {
    tickets.clear()

    sessionState.reset()

    sequence = 0
  } }
}
export const wechatState = createWechatState()
