/**
 * 【文件概述】浏览器微信授权中间状态的保存、回读与清理。
 * 【方法与导出清单】savePending、readPending、clearPending、browserCallback。
 * 【综合使用示例】const pending = readPending()
 */
import type { WechatChannel, WechatTicket } from '../models/wechat'
import { AGREEMENT_VERSION } from '../../agreement'

export interface PendingWechat {
  id: string
  expiresAt: number
  redirect: string
  version: string
  channel: WechatChannel
}
const key = 'customer-wechat-pending'

export function savePending(ticket: WechatTicket, redirect: string, channel: WechatChannel) {
  // #ifdef H5
  sessionStorage.setItem(key, JSON.stringify({ id: ticket.id, expiresAt: ticket.expiresAt, redirect, version: AGREEMENT_VERSION, channel }))

  // #endif
}
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
export function clearPending() {
  // #ifdef H5
  sessionStorage.removeItem(key)

  // #endif
}
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
