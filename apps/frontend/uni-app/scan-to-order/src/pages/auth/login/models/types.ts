import type { IAuthLoginRes } from '@/pages/auth/session'

export type WechatChannel = 'mini' | 'wechat-h5' | 'web'

export interface WechatTicket {
  id: string
  pollToken: string
  expiresAt: number
  qrContent?: string
  authorizationUrl?: string
}

export type WechatStatus = 'pending' | 'confirmed' | 'expired' | 'used'

export interface WechatPoll {
  status: WechatStatus
}

export interface WechatExchange {
  ticket?: string
  pollToken?: string
  code?: string
  state?: string
  channel: WechatChannel
  agreementVersion: string
}

export type WechatCredentials = IAuthLoginRes
