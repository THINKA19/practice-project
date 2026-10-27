/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

export type WechatChannelDto = 'mini' | 'wechat-h5' | 'web'

export interface WechatExchangeDto {
  ticket?: string
  pollToken?: string
  code?: string
  state?: string
  channel: WechatChannelDto
  agreementVersion: string
}

export interface WechatPollDto {
  status: WechatStatusDto
}

export interface WechatTicketDto {
  id: string
  pollToken: string
  expiresAt: number
  qrContent?: string
  authorizationUrl?: string
}

export type WechatStatusDto = 'pending' | 'confirmed' | 'expired' | 'used'
