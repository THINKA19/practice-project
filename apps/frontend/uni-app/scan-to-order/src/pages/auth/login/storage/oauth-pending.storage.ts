/**
 * 【文件概述】浏览器微信授权中间状态的保存、回读与清理。
 * 【方法与导出清单】savePending、readPending、clearPending、browserCallback。
 * 【综合使用示例】const pending = readPending()
 */
import type { WechatChannel, WechatTicket } from '../models/types'
import { AGREEMENT_VERSION } from '../../agreement'

export interface PendingWechat {
  id: string
  expiresAt: number
  redirect: string
  version: string
  channel: WechatChannel
}
const key = 'customer-wechat-pending'

/** 仅在 H5 会话存储中保存 OAuth state、到期时间和原业务目标，不保存用户凭证。 */
export function savePending(ticket: WechatTicket, redirect: string, channel: WechatChannel) {
  // #ifdef H5
  sessionStorage.setItem(key, JSON.stringify({ id: ticket.id, expiresAt: ticket.expiresAt, redirect, version: AGREEMENT_VERSION, channel }))

  // #endif
}
/** 回读 H5 OAuth 中间状态；渠道、协议版本或有效期不匹配时返回 null。 */
export function readPending(): PendingWechat | null {
  // #ifdef H5
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(key) || 'null')

    if (data && typeof data === 'object' && 'channel' in data && (data.channel === 'web' || data.channel === 'wechat-h5' || data.channel === 'mini') && 'id' in data && typeof data.id === 'string' && 'redirect' in data && typeof data.redirect === 'string' && 'version' in data && data.version === AGREEMENT_VERSION && 'expiresAt' in data && typeof data.expiresAt === 'number' && data.expiresAt > Date.now())
      return data as PendingWechat
  }
  catch {
    return null
  }
  // #endif
  return null
}
/** 仅清除本标签页的 H5 OAuth 中间状态，不清除共享登录会话。 */
export function clearPending() {
  // #ifdef H5
  sessionStorage.removeItem(key)

  // #endif
}
/** 优先读取页面参数中的 code/state，H5 再从真实搜索串补齐缺失参数。 */
export function browserCallback(query?: Record<string, unknown>) {
  let code = typeof query?.code === 'string' ? query.code : ''

  let state = typeof query?.state === 'string' ? query.state : ''

  // #ifdef H5
  const params = new URLSearchParams(location.search)

  code ||= params.get('code') || ''

  state ||= params.get('state') || ''

  // #endif
  return { code, state }
}
